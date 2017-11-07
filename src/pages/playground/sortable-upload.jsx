import React from 'react';
import { Row, Icon } from 'antd';
import Upload from '../../components/upload';

import BaseDao from '../../dao/base';
import { UPLOAD_URL } from '../../utils/constants';

class SortableUpload extends React.Component {
  state = {
    fileList: [],
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

  handleChange = ({ fileList }) => {
    console.log('=========', fileList);
  };

  render() {
    const renderUploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">点击上传</div>
      </div>
    );
    return (
      <div className="main-wrapper" style={{ padding: '10px' }}>
        <Row>
          <Upload
            action={UPLOAD_URL}
            data={{ token: this.state.token }}
            // fileList={this.state.fileList}
            onChange={this.handleChange}
          >
            {renderUploadButton}
          </Upload>
        </Row>
      </div>
    );
  }
}

export default SortableUpload;
