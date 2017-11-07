/* eslint-disable no-unused-vars */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Button, Input, Icon, Row, Col, Upload, Form, message } from 'antd';

import { redirect, queryTo, getSearch, parseParam, stringifyParam } from '../../utils/location-helper';

import SortableList, { arrayMove } from '../../components/sortable';
import BaseDao from '../../dao/base';

import { UPLOAD_URL, IMG_HOST } from '../../utils/constants';

const FormItem = Form.Item;

class UploadPage extends React.Component {
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
    imgItems: JSON.parse(localStorage.getItem('imgListCache')) || [],
    text: '',
    token: null,
    shareIcon: [],
    uuid: '',
    isShow: false,
  };

  componentDidMount() {
    this.getQiniuToken();
  }

  componentWillUnmount() {
    this.initLoading && this.initLoading.cancel();
  }

  getQiniuToken() {
    this.initLoading && this.initLoading.cancel();
    if (process.env.PUBLISH_ENV === 'production') {
      this.initLoading = BaseDao.fetchQiniuToken();
    } else {
      this.initLoading = BaseDao.fetchTestQiniuToken();
    }
    this.initLoading.then((data) => {
      if (data.code === 0) {
        this.setState({
          token: data.token,
        });
      }
    });
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


  handleShareIconUpload = ({ fileList, file, event }) => {
    console.log('file: ', file.status);
    let uuid = file.response ? file.response.key : '';
    let url = this.getImageUrl(uuid);
    let createItem = {};
    let newItems = this.state.imgItems;
    if (file.status === 'done') {
      createItem = {
        id: uuid,
        imgUrl: url,
      };
      newItems = newItems.concat(createItem);
    }
    if (file.status === 'error') {
      message.error('上传失败，请重试');
      this.getQiniuToken();
    }
    console.log(this.state.imgItems);
    this.setState({
      shareIcon: fileList,
      uuid,
      imgItems: newItems,
    });
    let jsonStr = JSON.stringify(this.state.imgItems);
    console.log(jsonStr);
    window.localStorage.setItem('imgListCache', JSON.stringify(this.state.imgItems));
  };

  getImageUrl = (uuid) => IMG_HOST + uuid;

  renderUploadButton = () => {
    return (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">点击上传</div>
      </div>
    );
  };

  renderImagList = () => {
    return (
      <Row gutter={2}>{this.state.imgItems.length && this.state.imgItems.length > 0 ? this.state.imgItems.map(item => (
        <Col xs={12} sm={8} md={6} lg={3} style={{ marginTop: 10 }}>
          <div><img src={item.imgUrl} alt="" style={{ width: 150, height: 100 }} /></div>
          <div><Input value={item.imgUrl} style={{ width: 150 }} /></div>
        </Col>
      )) : ''}
      </Row>
    );
  }


  render() {
    return (<div className="main-wrapper" style={{ padding: '10px' }}>
      <Row />
      <Row>
        <Form>
          <FormItem label="图片上传">
            <Upload
              action={UPLOAD_URL}
              listType="picture-card"
              data={{ token: this.state.token }}
              onChange={this.handleShareIconUpload}
            >
              {this.renderUploadButton()}
            </Upload>
          </FormItem>
          <FormItem label="上传记录：">
            {this.renderImagList()}
          </FormItem>
        </Form>
      </Row>
    </div>);
  }
}

export default UploadPage;

