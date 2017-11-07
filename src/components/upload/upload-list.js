import React from 'react';
import Animate from 'rc-animate';
import { Icon, Tooltip, Progress, Input } from 'antd';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import styles from './upload-list.less';

const { TextArea } = Input;
// https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
const previewFile = (file, callback) => {
  const reader = new FileReader();
  reader.onloadend = () => callback(reader.result);
  reader.readAsDataURL(file);
};

class UploadList extends React.Component {
  /** 事件处理 */
  handleClose = (file) => {
    const onRemove = this.props.onRemove;
    if (onRemove && !this.props.disabled) {
      onRemove(file);
    }
  };
  handlePreview = (file, e) => {
    e.stopPropagation();
    const { onPreview } = this.props;
    if (!onPreview) {
      return;
    }
    e.preventDefault();
    return onPreview(file);
  };

  componentDidUpdate() {
    this.props.items.forEach(file => {
      if (typeof document === 'undefined' ||
        typeof window === 'undefined' ||
        !window.FileReader || !window.File ||
        !(file.originFileObj instanceof File) ||
        file.thumbUrl !== undefined) {
        return;
      }
      file.thumbUrl = '';
      /* eslint-enable */
      previewFile(file.originFileObj, (previewDataUrl) => {
        /* eslint-disable */
        file.thumbUrl = previewDataUrl;
        /* eslint-enable */
        this.forceUpdate();
      });
    });
  }

  render() {
    const {
      prefixCls,
      items = [],
      showPreviewIcon,
      showRemoveIcon,
      locale,
      onSortEnd,
      listType,
    } = this.props;
    const list = items.map((file, index) => {
      // icon
      let icon = <Icon type={file.status === 'uploading' ? 'loading' : 'paper-clip'} />;

      if (listType.indexOf('picture') !== -1) {
        if (file.status === 'uploading' || (!file.thumbUrl && !file.url)) { // 上传中 或 上传失败且预览图未生成
          if (listType === 'picture-card' || listType === 'picture-desc') {
            icon = <div className={`${prefixCls}-list-item-uploading-text`}>{locale.uploading}</div>;
          } else {
            icon = <Icon className={`${prefixCls}-list-item-thumbnail`} type="picture" />;
          }
        } else { // 显示上传的图片，预览图或者真实的图片
          icon = (
            <a
              className={`${prefixCls}-list-item-thumbnail`}
              onClick={e => this.handlePreview(file, e)}
              href={file.url || file.thumbUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={file.thumbUrl || file.url} alt={file.name} />
            </a>
          );
        }
      }

      // progress
      let progress;
      if (file.status === 'uploading') {
        // show loading icon if upload progress listener is disabled
        const loadingProgress = ('percent' in file) ? (
          <Progress type="line" {...this.props.progressAttr} percent={file.percent} />
        ) : null;

        progress = (
          <div className={`${prefixCls}-list-item-progress`} key="progress">
            {loadingProgress}
          </div>
        );
      }
      // preview
      const preview = file.url ? (
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${prefixCls}-list-item-name`}
          onClick={e => this.handlePreview(file, e)}
          title={file.name}
        >
          {file.name}
        </a>
      ) : (
        <span
          className={`${prefixCls}-list-item-name`}
          onClick={e => this.handlePreview(file, e)}
          title={file.name}
        >
          {file.name}
        </span>
      );
      // previewIcon
      const style = (file.url || file.thumbUrl) ? undefined : {
        pointerEvents: 'none',
        opacity: 0.5,
      };
      const previewIcon = showPreviewIcon ? (
        <a
          href={file.url || file.thumbUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={style}
          onClick={e => this.handlePreview(file, e)}
          title={locale.previewFile}
        >
          <Icon type="eye-o" />
        </a>
      ) : null;
      const removeIcon = showRemoveIcon ? (
        <Icon type="delete" title={locale.removeFile} onClick={() => this.handleClose(file)} />
      ) : null;
      const removeIconCross = showRemoveIcon ? (
        <Icon type="cross" title={locale.removeFile} onClick={() => this.handleClose(file)} />
      ) : null;
      // actions
      const actions = ((listType === 'picture-card' || listType === 'picture-desc') && file.status !== 'uploading')
        ? <span className={`${prefixCls}-list-item-actions`}>{previewIcon}{removeIcon}</span>
        : removeIconCross;
      // iconAndPreview
      let message;
      if (file.response && typeof file.response === 'string') {
        message = file.response;
      } else {
        message = (file.error && file.error.statusText) || locale.uploadError;
      }

      // 对图片描述的编辑框
      const desc = listType === 'picture-desc'
        ? <TextArea className={`${prefixCls}-list-item-input`} placeholder={this.props.descPlaceholder} maxLength={this.props.descMaxLength} defaultValue={file.description} onBlur={(e) => this.props.onDescChange(e.target.value, file)} />
        : null;

      const iconAndPreview = (file.status === 'error')
        ? <Tooltip title={message}>{icon}{preview}</Tooltip>
        : <span>{icon}{preview}</span>;
      const infoUploadingClass = classNames({
        [`${prefixCls}-list-item`]: true,
        [`${prefixCls}-list-item-${file.status}`]: true,
      });
      const SortableItem = SortableElement(() => (
        <div className={infoUploadingClass} >
          <div className={`${prefixCls}-list-item-info ${prefixCls}-list-item-${listType}`}>
            {iconAndPreview}
          </div>
          {actions}
          <Animate transitionName="fade" component="">
            {progress}
          </Animate>
          {desc}
        </div>
      ));
      return <SortableItem key={file.uid} index={index} />;
    });
    const listClassNames = classNames({
      [`${prefixCls}-list`]: true,
      [`${prefixCls}-list-${listType}`]: true,
    });

    // 图片卡片和图片加描述的类型事，使用内联样式
    const animationDirection =
      listType === ('picture-card' || 'picture-desc') ? 'animate-inline' : 'animate';
    const SortableList = SortableContainer(() => (
      <Animate
        transitionName={`${prefixCls}-${animationDirection}`}
        component="div"
        className={listClassNames}
      >
        {list}
      </Animate>
    ));
    return (
      <SortableList
        axis="xy"
        pressDelay={150}
        useWindowAsScrollContainer
        onSortEnd={onSortEnd}
        helperClass={styles['sortable-item']}
      />
    );
  }
}

UploadList.defaultProps = {
  items: [],
  progressAttr: {
    strokeWidth: 2,
    showInfo: false,
  },
  prefixCls: 'ant-upload',
  showRemoveIcon: true,
  showPreviewIcon: true,
  onPreview: null,
  onRemove: null,
  onSortEnd: null,
  onDescChange: () => {},
  descPlaceholder: '',
  children: null,
  listType: 'text', // or picture
  disabled: false,
};
UploadList.propTypes = {
  items: PropTypes.array,
  progressAttr: PropTypes.object,
  prefixCls: PropTypes.string,
  showRemoveIcon: PropTypes.bool,
  showPreviewIcon: PropTypes.bool,
  disabled: PropTypes.bool,
  locale: PropTypes.object.isRequired,
  onPreview: PropTypes.func,
  onRemove: PropTypes.func,
  onSortEnd: PropTypes.func,
  onDescChange: PropTypes.func,
  descPlaceholder: PropTypes.string,
  descMaxLength: PropTypes.number.isRequired,
  children: PropTypes.object,
  listType: PropTypes.string,
};

export default UploadList;
