export default class Vertex3 {
    constructor(coord) {
        this.posn = coord;
        this.normal = 0;
        this.elemList = null;
        this.next = null;
        this.exitance.reset();
    }

    get normal() {
        e = this.elemList;
        while (e != null) { // * null or undefined
            this.normal += e.elem.normal;
            this.elemList = this.elemList.next;
        }
        return this.normal.norm();
    }
}