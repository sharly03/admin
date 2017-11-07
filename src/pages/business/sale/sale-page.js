import React from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Row, Col, Input, Select, message, Badge, Modal } from 'antd';
import OperationLink from '../operation-link';
import FilterItem from '../../../components/filter-item';
import { PageList } from '../../../components/page-list';
import { parseParam, redirect, queryTo } from '../../../utils/location-helper';
import { formatDecimal2, dateFormat } from '../../../utils';
import dao from '../../../dao/sale';

import styles from './sale.less';

const Search = Input.Search;
const Option = Select.Option;
const FormItem = Form.Item;

const Filter = ({ form, filter, onSearch }) => {
  const handleSubmit = params => {
    const { getFieldsValue } = form;
    const fieldsValue = getFieldsValue();
    // 解析参数
    const query = {
      ...parseParam(location.search),
      ...fieldsValue,
      ...params,
      pageIndex: 1,
    };
    queryTo(location, query, true);
    onSearch(query);
  };

  const getFieldContainer = children => {
    const { getFieldDecorator } = form;
    const { commodityNo, contractNo, orderStatus = '' } = filter;
    const filedList = [
      { label: '标的编号', id: 'commodityNo', value: commodityNo },
      { label: '合同编号', id: 'contractNo', value: contractNo },
      { label: '状态', id: 'orderStatus', value: orderStatus },
    ];

    return filedList.map((filed, index) => {
      const { id, label, value } = filed;
      return (
        <Col
          order={index}
          xl={{ span: 6 }}
          md={{ span: 8 }}
          key={id}
          style={{
            marginBottom: 16,
          }}
        >
          <FilterItem label={label}>
            {getFieldDecorator(id, { initialValue: value })(children[index])}
          </FilterItem>
        </Col>
      );
    });
  };

  return (
    <Row gutter={24} type="flex">
      {getFieldContainer([
        <Search placeholder="请输入" size="large" onSearch={() => handleSubmit()} />,
        <Search placeholder="请输入" size="large" onSearch={() => handleSubmit()} />,
        <Select style={{ width: '100%' }} size="large" onChange={value => handleSubmit({ orderStatus: value })}>
          <Option value="">全部</Option>
          <Option value="GS_100">待上架</Option>
          <Option value="GS_200">销售中</Option>
          <Option value="GS_300">已下架</Option>
          <Option value="GS_400">满标</Option>
          <Option value="GS_410">未满标</Option>
          <Option value="GS_520">已流标</Option>
          <Option value="GS_530">流标失败</Option>
        </Select>,
      ])}
      <Col
        md={{ span: 8, order: 1 }}
        xl={{ span: 6, order: 2 }}
      >
        <Button type="primary" size="large" onClick={() => handleSubmit()}>查询</Button>
      </Col>
    </Row>
  );
};
Filter.propTypes = {
  form: PropTypes.object.isRequired,
  filter: PropTypes.object.isRequired,
  onSearch: PropTypes.func.isRequired,
};

const ModalForm = ({ visible, loading, record, form, onOk, onCancel }) => {
  const { commodityCode, availableSaleAmount } = record;
  const { getFieldDecorator, resetFields } = form;
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 10 },
  };
  const handleOk = () => {
    const { validateFields } = form;
    validateFields((err, values) => {
      !err && onOk(values);
    });
  };

  return (
    <Modal
      title="份额维护"
      visible={visible}
      confirmLoading={loading}
      maskClosable={false}
      onOk={handleOk}
      onCancel={onCancel}
      afterClose={resetFields} // 每次关闭之后 重置表单
    >
      <FormItem label="标的编码" {...layout}>{commodityCode}</FormItem>
      <FormItem label="可预留份额" {...layout}>{availableSaleAmount}</FormItem>
      <FormItem label="预留份额" {...layout}>
        {getFieldDecorator('reservedAmount', {
          rules: [{ required: true, whitespace: true, message: '请输入预留份额' }],
        })(<Input />)}
      </FormItem>
    </Modal>
  );
};
ModalForm.defaultProps = {
  visible: false,
  loading: false,
};
ModalForm.propTypes = {
  visible: PropTypes.bool,
  loading: PropTypes.bool,
  record: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

const FilterForm = Form.create()(Filter);
const ModalPortion = Form.create()(ModalForm);
const confirm = Modal.confirm;

const orderStatus = {
  GS_100: { status: 'default', text: '待上架' },
  GS_200: { status: 'processing', text: '销售中' },
  GS_300: { status: 'success', text: '已下架' },
  GS_410: { status: 'error', text: '未满标' },
  GS_400: { status: 'success', text: '满标' },
  GS_520: { status: 'success', text: '已流标' },
  GS_530: { status: 'error', text: '流标失败' },
};

class Sale extends React.Component {
  state = {
    loading: false,
    totalRowsCount: 0,
    saleItems: [],
    // 份额维护 Modal
    portionMaintainVisible: false,
    portionMaintainLoading: false,
    current: {},
  };

  componentDidMount() {
    this.fetchSaleList(parseParam(location.search));
  }
  componentWillUnmount() {
    this.salePendding && this.salePendding.cancel();
  }

  async fetchSaleList(query) {
    this.salePendding && this.salePendding.cancel();
    this.setState({ loading: true });
    this.salePendding = dao.fetchList({ ...query, pageSize: query.pageSize || 10 });
    const data = await this.salePendding;
    this.setState({ loading: false });
    if (data.code === 0) {
      const { items, totalRowsCount } = data.data;
      this.setState({ saleItems: items, totalRowsCount });
    } else {
      message.error(data.msg || '数据加载失败');
    }
  }

  handleSearch = query => this.fetchSaleList(query);
  handlePageChange = (pageIndex, pageSize) => {
    const query = {
      ...parseParam(location.search),
      pageIndex,
      pageSize,
    };
    queryTo(location, query, true);
    this.fetchSaleList(query);
  };
  handlePortionOk = async values => {
    console.log('份额维护确定', values);
    const { id: equityProductId } = this.state.current;
    const query = { ...values, equityProductId };
    this.setState({ portionMaintainLoading: true });
    const data = await dao.portionMaintain(query);
    this.setState({ portionMaintainLoading: false, portionMaintainVisible: false });
    if (data.code === 0) {
      message.success(data.msg);
    } else {
      message.error(data.msg);
    }
  };

  render() {
    const getOperations = record => {
      const { status, commodityCode, id: equityProductId } = record;
      const submit = {
        text: '提交',
        action: () => {
          confirm({
            title: '确定要提交到放款吗？',
            onOk: async () => {
              const data = await dao.submitAudit({ equityProductId });
              if (data.code === 0) {
                this.fetchSaleList(parseParam(location.search));
                message.success(data.msg);
              } else {
                message.error(data.msg);
              }
            },
          });
        },
      };
      const flow = {
        text: '流标',
        action: () => {
          confirm({
            title: '确定流标吗？',
            onOk: async () => {
              const data = await dao.fullFlow({ equityProductId, fullScaleFlag: true });
              if (data.code === 0) {
                this.fetchSaleList(parseParam(location.search));
                message.success(data.msg);
              } else {
                message.error(data.msg);
              }
            },
          });
        },
      };
      const orderDetail = { text: '下单详情', action: () => redirect('/business/sale/detail', false, { commodityCode }) };
      const upShelf = {
        text: '上架',
        action: () => {
          confirm({
            title: '确定上架吗？',
            onOk: async () => {
              const data = await dao.upAndDownShelf({ equityProductId, shelevsFlag: true });
              if (data.code === 0) {
                this.fetchSaleList(parseParam(location.search));
                message.success(data.msg);
              } else {
                message.error(data.msg);
              }
            },
          });
        },
      };
      const dowmShelf = {
        text: '下架',
        action: () => {
          confirm({
            title: '确定下架吗？',
            onOk: async () => {
              const data = await dao.upAndDownShelf({ equityProductId, shelevsFlag: false });
              if (data.code === 0) {
                this.fetchSaleList(parseParam(location.search));
                message.success(data.msg);
              } else {
                message.error(data.msg);
              }
            },
          });
        },
      };
      const userMaintain = { text: '用户维护', action: () => redirect('/business/sale/maintain', false, {}) };
      const portionMaintain = {
        text: '份额维护',
        action: () => {
          this.setState({ current: record, portionMaintainVisible: true });
        },
      };
      const operations = {
        GS_100: [userMaintain, portionMaintain, upShelf, orderDetail],
        GS_200: [userMaintain, dowmShelf, orderDetail],
        GS_300: [submit, flow, portionMaintain, upShelf, orderDetail],
        GS_410: [submit, flow, portionMaintain, orderDetail],
        GS_400: [submit, flow, orderDetail],
        GS_520: [orderDetail],
        GS_530: [flow, orderDetail],
      };
      return operations[status];
    };
    const saleColumns = [
      // { dataIndex: 'order', title: '序号', render: (text, record, index) => index + 1 },
      {
        dataIndex: 'commodityCode',
        title: '标的编号',
        render: (text, { id }) => <a onClick={() => redirect('/business/commodity/preview', false, { commodityId: id })}>{text}</a>,
      },
      { dataIndex: 'contractNo', title: '合同编号' },
      { dataIndex: 'totalAmount', title: '标的金额（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'annualRate', title: '预期年化率', className: 'align-center', render: text => `${text}%` },
      { dataIndex: 'saledAmount', title: '已销售金额（元）', className: 'align-right', render: text => formatDecimal2(text) },
      {
        dataIndex: 'buyTime',
        title: '预售期',
        render: (text, { buyBeginTime, buyEndTime }) => {
          const overdue = Date.now() > buyEndTime;
          return <span style={{ color: overdue && '#ff0000' }}>{dateFormat(buyBeginTime)}~{dateFormat(buyEndTime)}</span>;
        },
      },
      { dataIndex: 'salesTargetCode', title: '销售对象', render: () => <a onClick={() => redirect('/business/sale/maintain', false, {})}>用户明细</a> },
      { dataIndex: 'status', title: '状态', render: status => <Badge {...orderStatus[status]} /> },
      { dataIndex: 'operation', title: '操作', render: (text, record) => <OperationLink options={getOperations(record)} /> },
    ];
    const query = parseParam(location.search);
    const { loading, totalRowsCount, saleItems, portionMaintainVisible, portionMaintainLoading, current } = this.state;
    const pagination = {
      total: totalRowsCount,
      current: parseInt(query.pageIndex, 10) || 1,
      pageSize: parseInt(query.pageSize, 10) || 10,
      onChange: this.handlePageChange,
    };

    return (
      <div style={{ margin: 16 }} className={styles['sale-page']}>
        <FilterForm filter={query} onSearch={this.handleSearch} />
        <PageList
          rowKey="id"
          loading={loading}
          columns={saleColumns}
          dataSource={saleItems}
          pagination={pagination}
        />
        <ModalPortion
          visible={portionMaintainVisible}
          loading={portionMaintainLoading}
          record={current}
          onOk={this.handlePortionOk}
          onCancel={() => this.setState({ portionMaintainVisible: false })}
        />
      </div>
    );
  }
}

export default Sale;
