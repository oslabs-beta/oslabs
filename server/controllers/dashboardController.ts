import { DashboardController, NumOfData, GeneralData, start, end, axios, k8s, client } from '../../types';
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api); 
const k8sApi1 = kc.makeApiClient(k8s.AppsV1Api); 
const k8sApi3 = kc.makeApiClient(k8s.NetworkingV1Api);
client.collectDefaultMetrics();

const dashboardController: DashboardController = {

  getNumberOf: async (req, res, next) => {
    const numOfData: NumOfData = {
      nodes: 0,
      pods: 0,
      namespaces: 0,
      deployments: 0,
      ingresses: 0,
      services: 0
    };
    k8sApi.listNode()
    .then((data: any) => numOfData.nodes = data.body.items.length);
    k8sApi.listPodForAllNamespaces()
    .then((data: any) => numOfData.pods = data.body.items.length);
    k8sApi.listNamespace()
    .then((data: any) => numOfData.namespaces = data.body.items.length);
    k8sApi1.listDeploymentForAllNamespaces()
    .then((data: any) => numOfData.deployments = data.body.items.length);
    k8sApi3.listIngressForAllNamespaces()
    .then((data: any) => numOfData.ingresses = data.body.items.length);
    k8sApi.listServiceForAllNamespaces()
    .then((data: any) => {
      numOfData.services = data.body.items.length;
      res.locals.data = numOfData;
      return next();
    })
  },

  getGeneralClusterInfo: async (req, res, next) => {
    const generalData: GeneralData = {
      totalUserCpu: 0,
      totalSystemCpu: 0,
      totalUserSystemCpu: 0,
      residentMemBytes: 0,
      eventLoopLag: 0,
      totalActiveResources: 0,
      totalActiveHandles: 0,
      totalActiveRequests: 0,
      heapSizeBytes: 0,
      heapSizeUsed: 0,
      //nodeDuration: number
    }
    client.register.getMetricsAsJSON()
    .then((data: any) => {
      generalData.totalUserCpu = data[0].values[0].value;
      generalData.totalSystemCpu = data[1].values[0].value;
      generalData.totalUserSystemCpu = data[2].values[0].value;
      generalData.residentMemBytes = data[4].values[0].value;
      generalData.eventLoopLag = data[5].values[0].value;
      generalData.totalActiveResources = data[14].values[0].value;
      generalData.totalActiveHandles = data[16].values[0].value;
      generalData.totalActiveRequests = data[18].values[0].value;
      generalData.heapSizeBytes = data[19].values[0].value;
      generalData.heapSizeUsed = data[20].values[0].value;
      res.locals.data = generalData;
      return next();
    })
  },

  getTotalMem: async (req, res, next) => {
    try {
      const data = await axios.get(`http://localhost:9090/api/v1/query_range?query=sum(container_memory_usage_bytes)&start=${start}&end=${end}&step=10m`);
      res.locals.totalMem = data;
      return next();
    } catch (err) {
      return next({
        log: `Error in dashboardController.getTotalMem: ${err}`,
        status: 500,
        message: {err: 'Error occured while retrieving dashboard memory data'},
      });
    }
  },

  getTotalCpu: async (req, res, next) => {
    try {
      const data = await axios.get(`http://localhost:9090/api/v1/query_range?query=sum(rate(container_cpu_usage_seconds_total[10m]))*100&start=${start}&end=${end}&step=10m`);
      res.locals.totalCpu = data;
      return next();
    } catch (err) {
      return next({
        log: `Error in dashboardController.getTotalCpu: ${err}`,
        status: 500,
        message: { err: 'Error occured while retrieving dashboard cpu data' },
      });
    }
  }

}

module.exports = dashboardController;