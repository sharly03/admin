import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Modal, message } from 'antd';
import isEqual from 'lodash/isEqual';

import Upload from '../upload'; // 具有拖拽功能的上传组件
import { UPLOAD_URL, IMG_HOST } from '../../utils/constants';
import BaseDao from '../../dao/base';

// 上传资源类型
const PICTURE_CARD = 'picture-card';

// 这个组件不要改成PureComponent，如果不得不改，
// 需要修改子组件对于fileList的修改方式，每次回调都返回新的fileList
// 否则将无法触发子组件render
export class FileInput extends React.Component {
  static propTypes = {
    type: PropTypes.string,
    descPlaceholder: PropTypes.string,
    token: PropTypes.string.isRequired,
    footerText: PropTypes.string,
    onChange: PropTypes.func,
    maxLength: PropTypes.number,
    maxSize: PropTypes.number,
    descMaxLength: PropTypes.number,
    disabled: PropTypes.bool,
    /* eslint-disable react/require-default-props */
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]), // 这里设置了必填ant-design会有警告，所以不设置必填，但是设置默认值也有警告，所以这里也不设置默认值
    onTokenRefresh: PropTypes.func.isRequired,
  };

  static defaultProps = {
    type: PICTURE_CARD,
    footerText: '',
    maxLength: 1,
    maxSize: 1024,
    descPlaceholder: '',
    descMaxLength: 1000,
    desc: false,
    disabled: false,
    onChange() {},
  };

  constructor(props) {
    super(props);

    this.state = {
      fileList: this.processValueToFileList(this.props.value),
      previewImage: '',
      previewVisible: false,
    };
  }
  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if (!isEqual(this.props.value, nextProps)) {
      let fileList = this.processValueToFileList(nextProps.value);
      this.setState({ fileList });
    }
  }

  componentWilUnmount() {
    this.dataPending && this.dataPending.cancel();
  }

  fetchToken = async () => {
    this.dataPending && this.dataPending.cancel();
    this.dataPending = BaseDao.fetchQiniuToken();
    const result = await this.dataPending;
    if (result.code === 0) {
      this.props.onTokenRefresh(result.data);
    } else {
      message.error('系统繁忙，请刷新浏览器重试');
    }
  }

  processValueToFileList = (value) => {
    if (!value) return [];
    if (typeof value === 'string') {
      value = value.split(',');
    }
    return value.map((item, index) => {
      return {
        uid: `upload-${index}`,
        status: 'done',
        name: `文件: ${item.uuid || item}`,
        response: { key: item.uuid || item },
        url: IMG_HOST + (item.uuid || item),
        description: item.desc,
      };
    });
  };

  handleBeforeUpload = (file, fileList) => {
    if (fileList.length + this.state.fileList.length > this.props.maxLength) {
      if (file.uid === fileList[0].uid) { // 只提示一次
        message.error(`文件上传数量不得超过${this.props.maxLength}`);
      }
      return false;
    }

    if (file.size > (this.props.maxSize * 1024)) {
      message.error(`文件${file.name}上传失败，原因：大小超过了限制，请上传小于${this.props.maxSize}Kb的文件`, 5);
      return false;
    }
    if (this.isPictureType()) { // 上传类型为图片时判断类型
      const accept = ['jpeg', 'png', 'gif'];
      const fileType = file.type.split('/')[1];
      if (accept.indexOf(fileType) === -1) {
        message.error(`文件${file.name}上传失败，原因：格式不支持，支持的图片格式有: jpg,jpeg,png,gif `, 5);
        return false;
      }
    }
  }

  // 图片上传相关事件处理回调
  handleImageUpload = ({ file, fileList }) => {
    if (file.status === 'error') {
      if (file.error) {
        let msg;
        if (file.response && typeof file.response === 'string') {
          msg = file.response;
        } else {
          msg = (file.error && file.error.statusText) || '上传失败';
        }
        switch (file.error.status) {
          case 400:
            message.error('上传token未设置');
            break;
          case 401:
            message.error('上传凭证过期，请重试');
            this.fetchToken(); // 重新获取token
            break;
          default:
            message.error(msg);
        }
      }
    }
    this.setState({ fileList });
    if (fileList.every(fileItem => fileItem.status === 'done')) {
      let value = fileList.map((item) => {
        return item.response.key;
      }).join(',');
      if (this.props.type === 'picture-desc') {
        value = fileList.map((item) => {
          return { uuid: item.response.key, desc: item.description };
        });
      }
      this.props.onChange(value);
    }
  };

  // 取消预览
  handleCancel = () => this.setState({ previewVisible: false });

  // 打开图片预览
  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  };

  isPictureType() {
    return this.props.type.indexOf('picture') !== -1;
  }
  renderUploadButton = () => {
    return (
      <div>
        {this.props.type === PICTURE_CARD ?
          <div>
            <Icon type="plus" />
            <div className="ant-upload-text">点击上传</div>
          </div>
          :
          <Button disabled={this.props.disabled}>
            <Icon type="upload" /> 点击上传
          </Button>
        }
      </div>
    );
  };

  render() {
    const { type, token, footerText, maxLength, disabled } = this.props;

    return (
      <div className="clearfix">
        <Upload
          disabled={disabled}
          action={UPLOAD_URL}
          listType={type}
          accept={this.isPictureType() ? '.jpg, .jpeg, .png, .gif' : '*'}
          data={{ token }}
          multiple={maxLength > 1}
          descPlaceholder={this.props.descPlaceholder}
          descMaxLength={this.props.descMaxLength}
          fileList={this.state.fileList}
          onPreview={this.handlePreview}
          beforeUpload={this.handleBeforeUpload}
          onChange={this.handleImageUpload}
        >{this.state.fileList.length >= maxLength ? null : this.renderUploadButton()}</Upload>

        <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="preview" style={{ width: '100%' }} src={this.state.previewImage} />
        </Modal>
        <div>{ footerText }</div>
      </div>
    );
  }
}
