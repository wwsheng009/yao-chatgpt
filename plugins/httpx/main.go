package main

//插件模板
import (
	"encoding/json"
	"fmt"
	"httpclient/httpx"
	"io"
	"log"
	"os"
	"path"
	"path/filepath"

	"github.com/hashicorp/go-hclog"
	"github.com/joho/godotenv"
	"github.com/yaoapp/gou/process"
	"github.com/yaoapp/kun/grpc"
)

// 定义插件类型，包含grpc.Plugin
type DemoPlugin struct{ grpc.Plugin }

// 设置插件日志到单独的文件
func (demo *DemoPlugin) setLogFile() {
	var output io.Writer = os.Stdout
	//开启日志
	logroot := os.Getenv("PLUGIN_HTTPX_CLIENT")
	if logroot == "" {
		logroot = "./logs"
	}
	if logroot != "" {
		logfile, err := os.Create(path.Join(logroot, "plugin.log"))
		if err == nil {
			output = logfile
		}
	}
	demo.Plugin.SetLogger(output, grpc.Trace)
}

// 插件执行需要实现的方法
// 参数name是在调用插件时的方法名，比如调用插件demo的Hello方法是的规则是plugins.demo.Hello时。
//
// 注意：name会自动的变成小写
//
// args参数是一个数组，需要在插件中自行解析。判断它的长度与类型，再转入具体的go类型。
func (demo *DemoPlugin) Exec(name string, args ...interface{}) (*grpc.Response, error) {

	demo.Logger.Log(hclog.Trace, "plugin method called", name)
	demo.Logger.Log(hclog.Trace, "args", args)

	//输出值支持的类型：map/interface/string/integer,int/float,double/array,slice
	var out = httpx.Response{}
	switch name {
	case "post":
		if len(args) < 1 {
			out = httpx.Response{Status: 400, Message: "参数不足，需要一个参数"}
			break
		}
		var process = process.New("httpx.client.post", args...)
		res, err := process.Exec()
		if err != nil {
			out = httpx.Response{Status: 400, Message: err.Error()}
		} else {
			if res, ok := res.(*httpx.Response); ok {
				out = *res
			}
		}

	default:
		out = httpx.Response{Status: 400, Message: fmt.Sprintf("%s不支持", name)}
	}

	//所有输出需要转换成bytes
	bytes, err := json.Marshal(out)
	if err != nil {
		return nil, err
	}
	//支持的类型：map/interface/string/integer,int/float,double/array,slice
	return &grpc.Response{Bytes: bytes, Type: "map"}, nil
}

// 生成插件时函数名修改成main
func main() {
	httpx.Register()
	plugin := &DemoPlugin{}
	plugin.setLogFile()
	grpc.Serve(plugin)
}

// 调试时开启，需要直接调试时修改成main
func main1() {
	httpx.Register()
	environmentPath := filepath.Join(".env")
	err := godotenv.Load(environmentPath)

	if err != nil {
		log.Fatal("Error loading .env file")
	}
	h1 := os.Getenv("HTTP_RROXY")
	h2 := os.Getenv("HTTPS_PROXY")
	println(h1, h2)

	plugin := &DemoPlugin{}
	plugin.setLogFile()
	rest, err := plugin.Exec("post", "https://api.openai.com/v1/chat/completions")
	if err != nil {
		println("error", err.Error())
	}
	println(rest)
}
