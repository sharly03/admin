import React from 'react';
import PropTypes from 'prop-types';
import { Card, message } from 'antd';

import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import { upload } from '../../utils/request';

import { UPLOAD_URL } from '../../utils/constants';
import { getPictrueUrl } from '../../utils';
import './editor.less';

class QuillEditor extends React.Component {
  // static
  static propTypes = {
    token: PropTypes.string.isRequired,
  };
  modules = {
    toolbar: {
      container: [
        [{ size: [] }, { align: [] }, 'direction'],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'super' }, { script: 'sub' }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      handlers: {
        // handlers object will be merged with default handlers object
        image: () => {
          this.uploadBtn.click();
        },
      },
    },

  };

  formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image',
  ];

  handleUploadChange = (event) => {
    // 如果props.token为空不能上传
    const { token } = this.props;
    if (token) {
      upload({
        url: UPLOAD_URL,
        data: {
          token,
          file: event.target.files[0],
        },
      }).then((data) => {
        const range = this.quillRef.getEditor().getSelection();
        let position = range ? range.index : 0;
        let value = getPictrueUrl(data.key);
        this.quillRef.getEditor().insertEmbed(position, 'image', value, 'user');
      });
    } else {
      message.error('上传配置信息错误，请刷新页面重试');
    }
  };

  render() {
    return (
      <Card bodyStyle={{ padding: 0 }}>
        <ReactQuill ref={(el) => { this.quillRef = el; }}
          theme="snow"
          placeholder={'开始你的文字之旅...'}
          modules={this.modules}
          {...this.props}
        />
        <input ref={(el) => { this.uploadBtn = el; }} type="file" onChange={this.handleUploadChange} style={{ display: 'none' }} />
      </Card>
    );
  }
}

export default QuillEditor;
