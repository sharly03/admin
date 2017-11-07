import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button, Row, message } from 'antd';
import { TEST_TOKEN_KEY } from '../../utils/constants';

import Footer from '../../components/layout/footer';
import BaseDao from '../../dao/base';

import logo from '../../images/logo.png';
import styles from './login.less';

const FormItem = Form.Item;

class Login extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  static propTypes = {
    form: PropTypes.object.isRequired,
  };

  static defaultProps = {
    user: null,
  };

  state = {
    loading: false,
    password: {},
  };
  componentWillUnmount() {
    this.loginLoading && this.loginLoading.cancel();
  }

  handlePasswordChange = () => {
    if (this.state.password.validateStatus) {
      this.setState({
        password: {},
      });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { validateFieldsAndScroll } = this.props.form;

    this.setState({
      loading: true,
    });

    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        this.setState({
          loading: false,
        });
        return;
      }

      this.loginLoading && this.loginLoading.cancel();
      this.loginLoading = BaseDao.login(values);
      this.loginLoading.then((result) => {
        this.setState({
          loading: false,
        });

        if (result && result.code === 0) {
          // 登录成功
          window.localStorage.setItem(TEST_TOKEN_KEY, result.data.token);
          BaseDao.updateCurrentUser(result.data);
          this.context.router.replace('/');
        } else {
          // 登录失败
          if (!result) {
            message.error('登录失败');
            return;
          }

          switch (result.code) {
            case 100002: {
              // 密码错误
              const password = {
                validateStatus: 'error',
                errorMsg: result.msg,
              };
              this.setState({ password });
              break;
            }
            default:
              message.error(result.msg);
          }
        }
      });
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    const { password } = this.state;
    return (
      <div className={styles.wrapper}>


        <div className={styles.form}>
          <div className={styles.logo}>
            <img alt={'logo'} src={logo} />
            <span>薪乐宝运营管理平台(存管版)</span>
          </div>
          <form>
            <FormItem hasFeedback>
              {getFieldDecorator('employeId', {
                rules: [
                  { required: true, whitespace: true, message: '请输入您的登录账户' },
                  { maxLength: 20, message: '登录账户长度不得超过20个字符' },
                ],
              })(<Input size="large" onPressEnter={this.handleSubmit} placeholder="手机号/邮箱" />)}
            </FormItem>
            <FormItem hasFeedback validateStatus={password.validateStatus} help={password.errorMsg}>
              {getFieldDecorator('password', {
                rules: [
                  { required: true, whitespace: true, message: '请输入您的密码' },
                  { maxLength: 16, message: '密码长度不得超过16个字符' },
                ],
              })(<Input size="large" type="password" onPressEnter={this.handleSubmit} onChange={this.handlePasswordChange} placeholder="密码" />)}
            </FormItem>
            <div className={styles.errMsg}>{this.state.commonErrorMsg}</div>
            <Row>
              <Button type="primary" size="large" onClick={this.handleSubmit} loading={this.state.loading}>
                登录
              </Button>
            </Row>

          </form>
        </div>
        <Footer className={styles.footer} />
      </div>

    );
  }
}

export default Form.create()(Login);
