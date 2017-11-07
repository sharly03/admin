import React, { Component } from 'react';
import RcUpload from 'rc-upload';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { arrayMove } from 'react-sortable-hoc';
import UploadList from './upload-list';

const defaultLocale = {
  uploading: '文件上传中',
  removeFile: '删除文件',
  uploadError: '上传失败，请重试',
  previewFile: '预览文件',
};

const fileToObject = file => ({
  lastModified: file.lastModified,
  lastModifiedDate: file.lastModifiedDate,
  name: file.filename || file.name,
  size: file.size,
  type: file.type,
  uid: file.uid,
  response: file.response,
  error: file.error,
  percent: 0,
  originFileObj: file,
  status: null,
  description: null,
});
const getFileItem = (file, fileList) => {
  const matchKey = file.uid !== undefined ? 'uid' : 'name';
  return fileList.filter(item => item[matchKey] === file[matchKey])[0];
};
const removeFileItem = (file, fileList) => {
  const matchKey = file.uid !== undefined ? 'uid' : 'name';
  const removed = fileList.filter(item => item[matchKey] !== file[matchKey]);
  if (removed.length === fileList.length) {
    return null;
  }
  return removed;
};

class Upload extends Component {
  state = {
    fileList: this.props.fileList || [],
    previewUrl: '',
    previewName: '',
  };

  /** 事件处理 */
  onStart = file => {
    let targetItem;
    let nextFileList = [...this.state.fileList];
    if (file.length > 0) {
      targetItem = file.map(f => {
        const fileObject = fileToObject(f);
        fileObject.status = 'uploading';
        return fileObject;
      });
      nextFileList = nextFileList.concat(targetItem);
    } else {
      targetItem = fileToObject(file);
      targetItem.status = 'uploading';
      nextFileList.push(targetItem);
    }
    this.onChange({
      file: targetItem,
      fileList: nextFileList,
    });
  };
  onProgress = (e, file) => {
    let fileList = this.state.fileList;
    let targetItem = getFileItem(file, fileList);
    // removed
    if (!targetItem) {
      return;
    }
    targetItem.percent = e.percent;
    this.onChange({
      event: e,
      file: { ...targetItem },
      fileList: this.state.fileList,
    });
  };
  onSuccess = (response, file) => {
    try {
      if (typeof response === 'string') {
        response = JSON.parse(response);
      }
    } catch (e) { /* do nothing */
    }
    let fileList = this.state.fileList;
    let targetItem = getFileItem(file, fileList);
    // removed
    if (!targetItem) {
      return;
    }
    targetItem.status = 'done';
    targetItem.response = response;
    this.onChange({
      file: { ...targetItem },
      fileList,
    });
  };
  onError = (error, response, file) => {
    let fileList = this.state.fileList;
    let targetItem = getFileItem(file, fileList);
    // removed
    if (!targetItem) {
      return;
    }
    targetItem.error = error;
    targetItem.response = response;
    targetItem.status = 'error';
    this.onChange({
      file: { ...targetItem },
      fileList,
    });
  };
  onChange = info => {
    if (!this.props.fileList) {
      this.setState({ fileList: info.fileList });
    }

    const { onChange } = this.props;
    if (onChange) {
      onChange(info);
    }
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    const fileList = arrayMove(this.state.fileList, oldIndex, newIndex);
    const file = { status: 'sorted' };
    this.onChange({
      file,
      fileList,
    });
  };

  onDescChange = (value, file) => {
    console.log('change', value);
    file.description = value;
    const nextFileList = this.state.fileList.concat();
    const index = nextFileList.findIndex(item => item.uid === file.uid);
    nextFileList[index] = file;
    this.onChange({
      file,
      fileList: nextFileList,
    });
  };

  handleManualRemove = file => {
    this.upload.abort(file);
    file.status = 'removed'; // eslint-disable-line
    const removedFileList = removeFileItem(file, this.state.fileList);
    if (removedFileList) {
      this.onChange({
        file,
        fileList: removedFileList,
      });
    }
  };
  handlePreview = file => {
    this.setState({
      previewUrl: file.url || file.thumbUrl,
      previewName: file.name,
      previewVisible: true,
    });
  };
  handlePreviewCancel = () => {
    this.setState({ previewVisible: false });
  };

  /** 生命周期 */
  componentWillReceiveProps(nextProps) {
    if (nextProps.fileList) {
      this.setState({
        fileList: nextProps.fileList,
      });
    }
  }

  render() {
    // upload button
    const { children, prefixCls, disabled, listType, showUploadList, onPreview, descMaxLength, descPlaceholder } = this.props;
    const uploadButtonCls = classNames(prefixCls, {
      [`${prefixCls}-select`]: true,
      [`${prefixCls}-select-${listType}`]: true,
      [`${prefixCls}-disabled`]: disabled,
    });
    const rcUploadProps = {
      onStart: this.onStart,
      onError: this.onError,
      onSuccess: this.onSuccess,
      listType,
      ...this.props,
    };
    delete rcUploadProps.className;
    const uploadButton = (
      <div className={uploadButtonCls} style={{ display: children ? '' : 'none' }} key="button" >
        <RcUpload {...rcUploadProps} onProgress={this.onProgress} ref={rcUpload => { this.upload = rcUpload; }} />
      </div>
    );

    // upload list
    const { showRemoveIcon, showPreviewIcon } = showUploadList;

    const uploadList = showUploadList ? (
      <UploadList
        disabled={disabled}
        descMaxLength={descMaxLength}
        listType={listType}
        descPlaceholder={descPlaceholder}
        items={this.state.fileList}
        onPreview={onPreview}
        onDescChange={this.onDescChange}
        onRemove={this.handleManualRemove}
        showRemoveIcon={showRemoveIcon}
        showPreviewIcon={showPreviewIcon}
        locale={this.props.locale}
      />
    ) : null;

    if (listType === 'picture-card') {
      return (
        <div className={classNames}>
          {uploadList}
          {uploadButton}
        </div>
      );
    }
    return (
      <div className={classNames}>
        {uploadButton}
        {uploadList}
      </div>
    );
  }
}

Upload.defaultProps = {
  children: null,
  prefixCls: 'ant-upload',
  disabled: false,
  listType: 'text',
  showUploadList: true,
  fileList: null,
  locale: defaultLocale,
  onChange: null,
  descPlaceholder: '',
  onPreview: () => {},
};
Upload.propTypes = {
  children: PropTypes.object,
  prefixCls: PropTypes.string,
  disabled: PropTypes.bool,
  showUploadList: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),
  descPlaceholder: PropTypes.string,
  descMaxLength: PropTypes.number.isRequired,
  listType: PropTypes.string,
  fileList: PropTypes.array,
  locale: PropTypes.object,
  onChange: PropTypes.func,
  onPreview: PropTypes.func,
};

export default Upload;
