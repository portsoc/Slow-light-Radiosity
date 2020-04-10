export default class Instance {
  constructor(vertexList, surfaceList) {
    this.vertexList = vertexList;     // Vertex list
    this.surfaceList = surfaceList;   // Surface list
    this.next = null;                 // Next instance
  }
}
