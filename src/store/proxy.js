import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'

import { apiGetPageList } from "~/api/page";
import { apiGetRuleList } from "~/api/rule";
import { apiGetGzipFilterList } from "~/api/gzip_filter";

export const useProxyStore = defineStore(
    'proxy',
    () => {
        const selectPort = ref(0)
        const indexPort = ref(0)
        const pageList = ref([])
        const ruleList = ref([])
        const GZList = ref([])

        const methods = ref([
            { label: "GET", value: "GET", type: "primary" },
            { label: "POST", value: "POST", type: "success" },
            { label: "PUT", value: "PUT", type: "warning" },
            { label: "PATCH", value: "PATCH", type: "warning" },
            { label: "DELETE", value: "DELETE", type: "danger" },
            { label: "ANY", value: "ANY", type: "info" },
        ]);

        const matchTypes = ref([
            { label: "精确匹配", value: 0 },
            { label: "前缀匹配", value: 1 },
            { label: "正则匹配", value: 2 },
        ])

        const types = ref([
            { label: "路径", value: 1, type: "primary" },
            { label: "后缀", value: 2, type: "danger" },
            { label: "正则", value: 3, type: "warning" },
        ]);

        const getData = async () => {
            await getPages();
            await getRules();
            // await getGZIPFilters();
        }

        const getPages = async () => {
            let params = {
                pageNum: 1,
                pageSize: 10,
                condition: {
                    port: selectPort.value,
                }
            };
            let res = await apiGetPageList(params);
            pageList.value = res.list;
        }

        const getRules = async () => {
            let params = {
                pageNum: 1,
                pageSize: 10,
                condition: {
                    port: selectPort.value,
                }
            };
            let res = await apiGetRuleList(params);
            ruleList.value = res.list;
        }

        const getGZIPFilters = async () => {
            let params = {
                pageNum: 1,
                pageSize: 10,
                condition: {
                    port: selectPort.value,
                }
            };
            let res = await apiGetGzipFilterList(params);
            GZList.value = res.list;
        }

        return {
            selectPort,
            indexPort,
            pageList,
            ruleList,
            GZList,
            methods,
            matchTypes,
            types,

            getData,
        }
    },
    {
        persist: true
    }
)