export class Observable {
    observer: any[];

    constructor() {
        this.observer = [];
    }
    subscribe(item) {
        this.observer.push(item);
    }
    unsubscribe(item) {
        if (!this.observer) return 'empty';
        else {
            this.observer = this.observer.filter(subscribe => subscribe !== item);
        }
    }
    notify(data) {
        this.observer.forEach(item => item(data));
    }
}