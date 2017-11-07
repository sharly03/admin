import React from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Row, Col, Spin, Button, Tag } from 'antd';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';

import { parseParam } from '../../../utils/location-helper';
import { formatDecimal2, getPopupContainer } from '../../../utils';

import './contract.less';

const FormItem = Form.Item;
const Option = Select.Option;
const ColProps = {
  xs: 24,
  sm: 12,
};
const LeftFormItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};
const RightFormItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

const ASSERT_TYPE = {
  '01': '企业借款',
  '02': '收益权转让',
};

const EDITING_NAME = 'assetsEditing';
class AssetsInfo extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
    location: PropTypes.object,
  };
  state = {
    modifyMsg: false,
    assets: this.props.assets || {},
  };

  static propTypes = {
    assetsEditing: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    assetsList: PropTypes.array.isRequired,
    fetching: PropTypes.bool,
    assets: PropTypes.object.isRequired,
    fetchUser: PropTypes.func.isRequired,
    onEditAssets: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancelEditAssets: PropTypes.func.isRequired,
  };
  static defaultProps = {
    auditDataList: [],
    fetching: false,
  };
  constructor(props) {
    super(props);
    this.onSearch = debounce(this.onSearch, 800);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.assets, nextProps.assets)) {
      this.setState({ assets: nextProps.assets });
    }
  }

  isAdd = () => {
    const query = parseParam(location.search);
    return !query.id;
  }

  onSearch = (value) => {
    this.props.fetchUser(value);
  };

  handleChange = (value) => {
    const assets = this.props.assetsList.find(asset => asset.id === parseInt(value.key, 10));
    this.setState({
      assets,
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { assets } = this.state;
    const { fetching, assetsList, assetsEditing, onCancelEditAssets, onEditAssets } = this.props;
    const selectProps = {
      showSearch: true,
      labelInValue: true,
      placeholder: '请输入资产方名称查询',
      getPopupContainer,
      notFoundContent: fetching ? <Spin size="small" /> : null,
      filterOption: false,
      onSearch: this.onSearch,
      onChange: this.handleChange,
      style: { width: '65%', marginRight: 10 },
      showArrow: false,
    };
    const options = assetsList.map((asset) => <Option key={String(asset.id)}>{asset.assetName}</Option>);
    return (
      <div style={{ marginTop: 20 }}>
        <Row gutter={24}>
          <Col {...ColProps} className="nowrap">
            <FormItem label="资产方" {...LeftFormItemLayout}>
              {assetsEditing || this.isAdd() ? getFieldDecorator('assertSiteInfo', {
                initialValue: { key: String(assets.id || ''), label: assets.assetName || '' },
                rules: [{
                  required: true,
                  message: '请输入资产方名称查询',
                }],
              })(<Select {...selectProps}>{options}</Select>) : <span className="margin-right">{assets.assetName}</span>}
              { !this.isAdd() && (assetsEditing ?
                <span>
                  <Button style={{ padding: '0 8px' }} size="default" type="primary" htmlType="submit">保存</Button>
                  <Button style={{ padding: '0 8px', marginLeft: '8px' }} size="default" onClick={onCancelEditAssets.bind(null, EDITING_NAME)}>取消</Button>
                </span> : <a onClick={onEditAssets.bind(null, EDITING_NAME)} key="edit">修改</a>) }
            </FormItem>
          </Col>
          { assets.id &&
            <div>
              <Col {...ColProps}>
                <FormItem label="资产方类型" {...RightFormItemLayout}>
                  <span>{ASSERT_TYPE[assets.assetType]}</span>
                </FormItem>
              </Col>
              <Col {...ColProps}>
                <FormItem label="授信额度(元)" {...LeftFormItemLayout}>
                  <span>{formatDecimal2(assets.creditLine)}</span>
                </FormItem>
              </Col>
              <Col {...ColProps}>
                <FormItem label="担保方" {...RightFormItemLayout}>
                  <span>{(assets.guarantee && assets.guarantee.length > 0) ? assets.guarantee.map((item, index) => <Tag key={index}>{item}</Tag>) : '--'}</span>
                </FormItem>
              </Col>
              <Col {...ColProps}>
                <FormItem label="可用额度(元)" {...LeftFormItemLayout}>
                  <span>{formatDecimal2(assets.creditLine)}</span>
                </FormItem>
              </Col>
              <Col {...ColProps}>
                <FormItem label="项目方" {...RightFormItemLayout}>
                  <span>{(assets.project && assets.project.length > 0) ? assets.project.map((item, index) => <Tag key={index}>{item}</Tag>) : '--'}</span>
                </FormItem>
              </Col>
            </div>
          }
        </Row>
      </div>
    );
  }
}

export default AssetsInfo;
