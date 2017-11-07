import React from 'react';
import 'react-quill/dist/quill.snow.css';
import QuillEditor from '../../components/editor';
import BaseDao from '../../dao/base';

export default class RichTextPage extends React.Component {
  state = {
    text: '',
    token: null,
  }

  componentDidMount() {
    this.tokenLoading = BaseDao.fetchTestQiniuToken();
    this.tokenLoading.then((data) => {
      if (data.code === 0) {
        this.setState({
          token: data.token,
        });
      }
    });
  }

  componentWillUnmount() {
    this.tokenLoading && this.tokenLoading.cancel();
  }

  handleEditorChange = (value) => {
    this.setState({ text: value });
  }

  render() {
    if (!this.state.token) return null;
    return (
      <QuillEditor value={this.state.text} token={this.state.token} onChange={this.handleEditorChange} />
    );
  }
}
