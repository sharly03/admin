/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Button, Input, Icon, Row, Col, Upload } from 'antd';
import QRCode from 'qrcode.react';
import { redirect, queryTo, getSearch, parseParam, stringifyParam } from '../../utils/location-helper';

import SortableList, { arrayMove } from '../../components/sortable';
import FormDemo from './form-demo';
import { UPLOAD_URL, IMG_HOST } from '../../utils/constants';


class Playground extends React.Component {
  static contextTypes = {
    location: PropTypes.object,
  };


  state = {
    items: [
      'Gold',
      'Crimson',
      'Blueviolet',
      'Cornflowerblue',
    ],
    text: '',
    token: null,
    shareIcon: [],
    uuid: '',
  };

  componentDidMount() {
    let queryStr = getSearch('https://www.baidu.com/s?wd=sdf&rsv_spt=1&rsv_iqid=0xd431cd89000e17c3&issp=1&f=8&rsv_bp=0&rsv_idx=2&ie=utf-8&tn=baiduhome_pg&rsv_enter=1&rsv_sug3=4&rsv_sug1=2&rsv_sug7=100&rsv_sug2=0&inputT=748&rsv_sug4=749');
    console.log(queryStr);

    const query = parseParam(queryStr);
    console.log(query);

    console.log(stringifyParam(query));
  }

  componentWillUnmount() {

  }

  handleGoNewsPage = () => {
    queryTo('/news', { id: '123' });
  };

  handleCurrentPage = () => {
    queryTo(this.context.location, { id: '123' });
  };

  handleSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      items: arrayMove(this.state.items, oldIndex, newIndex),
    });
  };

  handleChange = (value) => {
    this.setState({ text: value });
  };

  handleShareIconUpload = ({ fileList, file, event }) => {
    console.log(file);
    let uuid = file.response ? file.response.key : '';


    this.setState({
      shareIcon: fileList,
      uuid,
    });
  };

  renderUploadButton = () => {
    return (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">点击上传</div>
      </div>
    );
  }

  render() {
    return (<div className="main-wrapper" style={{ padding: '10px' }}>
      <QRCode value="http://facebook.github.io/react/" size={50} />
      <FormDemo />
      <SortableList items={this.state.items} onSortEnd={this.handleSortEnd} />

      <br />


    </div>);
  }
}


export default Playground;
