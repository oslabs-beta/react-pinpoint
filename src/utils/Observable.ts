type CallBackFunc = (data: any) => any;

class Observable {
  observers: CallBackFunc[];
  constructor() {
    this.observers = [];
  }

  subscribe(f: CallBackFunc) {
    this.observers.push(f);
  }

  unsubsribe(f: CallBackFunc) {
    this.observers = this.observers.filter(sub => sub !== f);
  }

  notify(data) {
    this.observers.forEach(observer => observer(data));
  }
}

export default Observable;
