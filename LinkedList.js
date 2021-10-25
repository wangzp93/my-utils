/**
 * 双向链表
 */
const LinkedList = (function () {
  let start = end = null;
  return function() {
    this.get = function () {
      return start;
    };

    this.getList = function () {
      let obj = start;
      while(obj !== null) {
        console.log(obj.data);
        obj = obj.next;
      }
    }

    this.push = function (data) {
      if (start !== null) { // 非第一次存储
        const obj = {
          data,
          prev: end,
          next: null,
        };
        end.next = obj;
        end = obj;
      } else { // 第一次存储
        start = end = {
          data,
          prev: null,
          next: null,
        };
      }
    };

    // 思路：1234 -> 2134 -> 3214 -> 4321
    this.reverse = function () {
      const local = start;
      if (local !== null) {
        while(local.next) {
          const newStart = local.next;
          const newNext = newStart.next;
          // 修改游标next指针
          local.next = newNext;
          if (newNext !== null) {
            newNext.prev = local;
          }
          // 修改newStart指针
          newStart.next = start;
          start.prev = newStart;

          newStart.prev = null;
          start = newStart;
        }
      }
    }
  };
}());

var list = new LinkedList();
list.push('aaa');
list.push('bbb');
list.push('ccc');
list.push('ddd');
list.reverse();
list.getList();
