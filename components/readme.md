
# 远程插件

远程插件用于增强简单的显示控件与数据输入控件。

只适合增加一些没有远程加载的插件，比如增强显示。

不适合复杂的插件增强，特别是有大量第三方依赖库的。如果增加新的控件依赖，需要在xgen框架里注入库文件。

依赖库需要xgen主框加的配合，xgen本身只支持导入'react', 'react-dom', 'react/jsx-runtime'，自调整版本增加了antd控件库,其它控件依赖需要调整xgen框架中的代码packages/xgen/utils/preset/system_modules.ts

## 列表类的控件有以下的传入值类型


```js
//xgen/packages/xgen/components/base/PureTable/components/ViewContent.tsx

//__value 绑定结构中__bind对应的值
//__bind 绑定结构的字段名
//__name 数据列的标签名称
//__primary table配置主键，一般是id
//onSave 保存单个字段值的回调函数，会调用api:/api/__yao/table/hero/save,传入记录的id与需要保存的键值

    const props_view_component = {
		...field_detail.view.props,
		__namespace: namespace,
		__primary: primary,
		__bind: form_bind,
		__name: field_detail.name,
		__value: form_value,
		onSave
	}

    return <X type='view' name={field_detail.view.type} props={props_view_component}></X>
```

## 输入类型的控件

输入类型的控件会放在andt的Form控件中，需要在输入控件外层再包装一层自定义的Item控件,Item控件会使用字段标识(name=__bind)与标签名(label=__name)绑定Form控件

```js
	const real_props = {
		label: hideLabel ? (
			''
		) : (
			<a id={__name} className='disabled' href={`#${__name}`}>
				<label>{__name}</label>
			</a>
		),
		name: __bind,
		noStyle: !__name
	}
```




## 自定义控件列表

+ view/Rate 显示比分显示
+ edit/Rate 比分输入
+ edit/Input