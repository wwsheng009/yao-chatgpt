/**
 * before:data hook
 * @param {*} params
 * @returns
 */
function BeforeData(params) {
	log.Info("[chart] before data hook: %s", JSON.stringify(params));
	return [params];
}

/**
 * after:data hook
 * @param {*} data
 * @returns
 */
function AfterData(data) {
	log.Info("[chart] after data hook: %s", JSON.stringify(data));
	return data;
}

/**
 * Get Data
 * @param {*} params
 */
function Data(params) {
	//console.log("[chart] process data query: %s", JSON.stringify(params));
	log.Info("[chart] process data query: %s", JSON.stringify(params));
	return {
		count: getCount(),
	};
}

/**
 * Compute out
 * @param {*} field
 * @param {*} value
 * @param {*} data
 * @returns
 */
function Income(field, value, data) {
	log.Info(
		"[chart] Income Compute: %s",
		JSON.stringify({ field: field, value: value, data: data })
	);
	return value;
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
