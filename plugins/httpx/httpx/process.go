package httpx

import (
	"fmt"

	"github.com/yaoapp/gou/cast"
	"github.com/yaoapp/gou/process"
)

func Register() {
	process.Register("httpx.client.post", processHTTPPost)
}

// http.Post
// args[0] URL
// args[1] Payload <Optional> {"foo":"bar"} ["foo", "bar", {"k1":"v1"}], "k1=v1&k2=v2", "/path/root/file", ...
// args[2] Files   <Optional> {"foo":"/path/root/file"}
// args[3] Query Params <Optional> {"k1":"v1", "k2":"v2"}, ["k1=v1","k1"="v11","k2"="v2"], [{"k1":"v1"},{"k1":"v11"},{"k2":"v2"}], k1=v1&k1=v11&k2=k2
// args[4] Headers <Optional> {"K1":"V1","K2":"V2"}  [{"K1":"V1"},{"K1":"V11"},{"K2":"V2"}]
func processHTTPPost(process *process.Process) interface{} {

	process.ValidateArgNums(1)
	req, err := processHTTPNew(process, 3)
	if err != nil {
		return err
	}

	var payload interface{}
	if process.NumOfArgs() > 1 {
		payload = process.Args[1]
	}

	// // Upload a file via payload
	// if req.GetHeader("Content-Type") == "multipart/form-data" {

	// 	if file, ok := payload.(string); ok {
	// 		if fileRoot != "" {
	// 			//可以使用系统的temp目录与程序中的data目录
	// 			if !strings.HasPrefix(file, os.TempDir()) {
	// 				file = filepath.Join(fileRoot, file)
	// 			}
	// 		}

	// 		fileAbs, err := filepath.Abs(file)
	// 		if err != nil {
	// 			return &http.Response{
	// 				Status:  400,
	// 				Code:    400,
	// 				Message: fmt.Sprintf("args[%d] parameter error: %s", 2, err.Error()),
	// 				Headers: map[string][]string{},
	// 				Data:    nil,
	// 			}
	// 		}
	// 		payload = fileAbs
	// 	}
	// }

	// // Upload files via files
	// files := process.ArgsMap(2, map[string]interface{}{})
	// for name, val := range files {
	// 	if file, ok := val.(string); ok {
	// 		if fileRoot != "" {
	// 			//可以使用系统的temp目录与程序中的data目录
	// 			if !strings.HasPrefix(file, os.TempDir()) {
	// 				file = filepath.Join(fileRoot, file)
	// 			}
	// 		}

	// 		file, err := filepath.Abs(file)
	// 		if err != nil {
	// 			return &http.Response{
	// 				Status:  400,
	// 				Code:    400,
	// 				Message: fmt.Sprintf("args[%d] parameter error: %s", 2, err.Error()),
	// 				Headers: map[string][]string{},
	// 				Data:    nil,
	// 			}
	// 		}
	// 		req.AddFile(name, file)
	// 	}
	// }

	return req.Post(payload)
}

// make a *http.Request
func processHTTPNew(process *process.Process, from int) (*Request, *Response) {

	req := New(process.ArgsString(0))

	if process.NumOfArgs() > from {
		values, err := cast.AnyToURLValues(process.Args[from])
		if err != nil {
			return nil, &Response{
				Status:  400,
				Code:    400,
				Message: fmt.Sprintf("args[%d] parameter error: %s", from, err.Error()),
				Headers: map[string][]string{},
				Data:    nil,
			}
		}
		req.WithQuery(values)
	}

	if process.NumOfArgs() > from+1 {
		headers, err := cast.AnyToHeaders(process.Args[from+1])
		if err != nil {
			return nil, &Response{
				Status:  400,
				Code:    400,
				Message: fmt.Sprintf("args[%d] parameter error: %s", from+1, err.Error()),
				Headers: map[string][]string{},
				Data:    nil,
			}
		}
		req.WithHeader(headers)
	}

	return req, nil
}
