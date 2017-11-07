# 薪乐宝运营平台管理系统

## 快速开始

> 如果没有node环境，请先安装Node，建议安装Node 7.6以上版本，不支持Node4以及更低版本

---

> windows平台必须保证以安装了Python2.7

1. 安装包管理工具yarn，已安装可忽略

	```
	npm install -g yarn
	```

2. clone项目到本地

    ```
    cd workspace
    git clone ssh://git@git.xinlebao.com:10022/front-end/revolution-admin.git
    ```

3. 选择开发分支

	```
	git checkout dev
	```

3. 新建一个自己的分支,比如：

	```
	git checkout -b yournames
	```

4. 安装依赖

	```
	yarn install
	```

5. 启动服务

  - 如果是第一次启动或者有依赖更新的情况，需要先执行

	```
	yarn run dll

	```
	- 然后再执行

	```
	yarn start
	```
