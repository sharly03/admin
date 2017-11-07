import { Modal, message } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom';
import styles from './modal.less';

const { info, success, error, warning, confirm } = Modal;

const modal = {
  prefixCls: 'ant-modal',
  index: 1,
  info,
  success,
  error,
  warning,
  confirm,
};

modal.close = (index) => new Promise((resolve, reject) => {
  const { prefixCls } = modal;
  let div = document.getElementById(`${prefixCls}-reference-${index}`);
  if (index === undefined) {
    const references = document.querySelectorAll(`.${prefixCls}-reference`);
    div = references[references.length - 1];
  }
  if (!div) {
    message.error('关闭失败，未找到Dom');
    return;
  }
  const unmountResult = ReactDOM.unmountComponentAtNode(div);
  if (unmountResult && div.parentNode) {
    div.parentNode.removeChild(div);
    resolve(index);
  } else {
    reject(index);
  }
});

modal.closeAll = () => {
  const { prefixCls } = modal;
  const references = document.querySelectorAll(`.${prefixCls}-reference`);
  let i = 0;
  while (i < references.length) {
    modal.close();
    i++;
  }
};

modal.open = (config) => {
  const props = Object.assign({}, config);
  const { content, ...modalProps } = props;
  const { className, wrapClassName = '', verticalCenter = true } = modalProps;
  const { prefixCls } = modal;
  const index = modal.index++;
  const div = document.createElement('div');
  div.id = `${prefixCls}-reference-${index}`;
  div.className = `${prefixCls}-reference`;
  document.body.appendChild(div);

  ReactDOM.render(
    <Modal
      visible
      title="Title"
      transitionName="zoom"
      maskTransitionName="fade"
      onCancel={() => {
        modal.close(index);
      }}
      onOk={() => {
        modal.close(index);
      }}
      {...modalProps}
      wrapClassName={verticalCenter ? `${styles.verticalCenter} ${wrapClassName}` : wrapClassName}
      className={`${prefixCls} ${className} ${prefixCls}-${index}`}
    >
      <div className={`${prefixCls}-body-wrapper`} style={{ maxHeight: document.body.clientHeight - 256 }}>
        {content}
      </div>
    </Modal>, div);

  return index;
};

export default modal;
