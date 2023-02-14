function dataSource() {
	return {
		chat_count: [
			{
				value: getCount(),
				date: '2022-1-1'
			}
		]
	}
}
function getCount() {
	var query = new Query();

	var result = query.Get({
		select: [":SUM(access_count) as number"],
		wheres: [{ ":deleted_at": "删除", "=": null }],
		from: "$ai.setting",
	});
	//console.log(result[0].number)

	return result[0].number
}