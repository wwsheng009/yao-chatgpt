
/**
 * 按索引剔除数组中的某个位置的数据
 * yao run scripts.ai.model.splitAt 2 '::[1,2,3,4,5]'
 * @param {*integer} n 需要删除数据的索引
 * @param {Array} array 数组
 * @returns 
 */
function splitAt(n, array) {
    const n1 = parseInt(n)//如果是命令行执行一个要转换，要不然会变成字符串
    // console.log(array)
    // array.splice(n, 1)//！！splice是直接在原数组上删除
    return array.slice(0, n1).concat(array.slice(n1 + 1))
}
/**
 * 按索引剔除二维数据中每一列的某个位置的数据
 * run scripts.ai.model.splitArrayAt 2 '::[[1,2,3,4,5],[1,2,3,4,5],[1,2,3,4,5]]'
 * @param {integer} n 需要删除数据的索引
 * @param {Array} array 二维数组
 * @returns 
 */
function splitArrayAt(n, array) {
    let newArray = []
    // array.map(line => { line.splice(n, 1) })//！！splice是直接在原来的数组源上删除
    array.forEach(element => {
        newArray.push(splitAt(n, element))
    });
    return newArray
}


// 在数组里找到某一列，并根据这列的位置去删除另外一个数组中的数据

// let index = -1
// for (const key in arrs.columns) {
//     if (arrs.columns[key] == "permission") {
//         index = key
//         break;
//     }
// }
// arrs.columns.splice(index, 1)
// arrs.values.map(line => { line.splice(index, 1) })


