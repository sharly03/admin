import React from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col, message, Modal } from 'antd';
import SettleForm from './settle-form';
import { parseParam } from '../../../utils/location-helper';
import { formatDecimal2, dateFormat } from '../../../utils';
import dao from '../../../dao/refund';

import styles from './refund.less';


const FormItem = Form.Item;
const confirm = Modal.confirm;

const FormList = ({ title, lists, dataSource }) => {
  const children = lists.map((item, index) => {
    const { dataIndex, label, render } = item;
    const value = render && render instanceof Function ? render(dataSource[dataIndex], dataSource, index) : dataSource[dataIndex];
    return (
      <Col key={dataIndex} span={12}>
        <FormItem label={label} labelCol={{ span: 6 }}>
          {value}
        </FormItem>
      </Col>
    );
  });

  return (
    <div className={styles['form-list']}>
      {title && <p className="list-title">{title}</p>}
      <Row gutter={24} type="flex">
        {children}
      </Row>
    </div>
  );
};
FormList.defaultProps = {
  title: null,
};
FormList.propTypes = {
  title: PropTypes.string,
  lists: PropTypes.array.isRequired,
  dataSource: PropTypes.object.isRequired,
};

class RefundRecord extends React.Component {
  state = {
    loading: false,
    settleDetailSource: {},
    settleWaySource: {},
  };

  componentDidMount() {
    this.refundPlan(parseParam(location.search));
  }
  componentWillUnmount() {
    this.refundPendding && this.refundPendding.cancel();
  }

  async refundPlan(query) {
    this.refundPendding && this.refundPendding.cancel();
    this.setState({ loading: true });
    this.refundPendding = dao.refundPlan(query);
    const data = await this.refundPendding;
    this.setState({ loading: false });
    if (data.code === 0) {
      console.log('=========', data.data);
      this.setState({ settleDetailSource: data.data });
    } else {
      message.error(data.msg || '数据加载失败');
    }
  }
  settleSubmit = async query => {
    const data = await dao.settleSubmit(query);
    if (data === 0) {
      message.success(data.msg);
      // redirect('/business/refund', false);
    } else {
      message.error(data.msg);
    }
  };

  handleSettleSubmit = query => {
    console.log('settle submit', query);
    confirm({
      title: '确定要结算吗？',
      okText: '继续',
      onOk: () => this.settleSubmit({
        ...parseParam(location.search),
        ...query,
      }),
    });
  };

  render() {
    // 还款方式
    const settleWays = {
      '01': '按月付息',
      '02': '按季付息',
      '03': '一次性付息',
      '04': '等额本费',
      '05': '到期还本付息',
      '06': '先息后本',
    };
    const settleDetailLists = [
      { dataIndex: 'commodityCode', label: '标的编号' },
      { dataIndex: 'contractNum', label: '合同编号' },
      { dataIndex: 'assetNo', label: '资产编号' },
      { dataIndex: 'assetName', label: '资产方名称' },
      { dataIndex: 'commodityAmount', label: '标的金额', render: text => formatDecimal2(text) },
      { dataIndex: 'commodityRate', label: '预期年化率', render: text => text && `${text}%` },
      { dataIndex: 'incomeDate', label: '收益期', render: (_, { incomeBeginDate, incomeEndDate }) => `${dateFormat(incomeBeginDate)}~${dateFormat(incomeEndDate)}` },
      { dataIndex: 'incomePeriod', label: '期限' },
      { dataIndex: 'periods', label: '期数', render: (_, { currentSequnce, commodityPeroids }) => `${currentSequnce}/${commodityPeroids}` },
      { dataIndex: 'commoditySettleWay', label: '还款方式', render: text => settleWays[text] },
      { dataIndex: 'serviceFeeRate', label: '服务费率', render: text => text && `${text}%` },
      { dataIndex: 'serviceFee', label: '服务费', render: text => formatDecimal2(text) },
      { dataIndex: 'expectedSettlePrincipal', label: '还款本金', render: text => formatDecimal2(text) },
      { dataIndex: 'expectedSettleIncome', label: '还款利息', render: text => formatDecimal2(text) },
      { dataIndex: 'penaltyAmount', label: '罚息', render: text => formatDecimal2(text) },
      { dataIndex: 'compensateAmount', label: '补息', render: text => formatDecimal2(text) },
      { dataIndex: 'couponAmount', label: '券的收益', render: text => formatDecimal2(text) },
      { dataIndex: 'totalAmount', label: '还款总金额', render: text => formatDecimal2(text) },
    ];

    const { settleDetailSource } = this.state;

    return (
      <div style={{ margin: 16 }} className={styles['refund-settle']}>
        <FormList title="结算详细信息" lists={settleDetailLists} dataSource={settleDetailSource} />
        <SettleForm onSubmit={this.handleSettleSubmit} />
      </div>
    );
  }
}

export default Form.create()(RefundRecord);
