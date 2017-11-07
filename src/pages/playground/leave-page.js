import React from 'react';

class LeavePage extends React.PureComponent {
  componentDidMount() {
    window.addEventListener('beforeunload', this.handleLeavePage);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.handleLeavePage);
  }

  handleLeavePage = (event) => {
    const value = ' '; // 不为null或undefined即可弹窗提示
    event.returnValue = value;
    return value; // 兼容老浏览器
  }

  render() {
    return (
      <h1>该页面关闭时会有弹窗提示</h1>
    );
  }
}

export default LeavePage;
