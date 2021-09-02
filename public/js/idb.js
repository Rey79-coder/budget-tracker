let db;
const request = indexedDB.open('transactions', 1);

request.onupgradeneeded = function (event) {
    // save a reference to the database 
    const db = event.target.result;
    db.createObjectStore('transaction', { autoIncrement: true });
};

// upon a successful 
request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        // we haven't created this yet, but we will soon, so let's comment it out for now
        // uploadBudget();
    }
};

request.onerror = function (event) {
    // log error here
    console.log(event.target.errorCode);
};



function saveRecord(transaction) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.Transaction(['new_transaction'], 'readwrite');

    // access the object store for `new_budget`
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // add record to your store with add method
    transactionObjectStore.add(transaction);
}


function uploadTransaction() {
    // open a transaction on your db
    const transaction = db.Transaction(['new_transaction'], 'readwrite');

    // access your object store
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // get all records from store and set to a variable
    const getAll = transactionObjectStore.getAll();


    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function () {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // open one more transaction
                    const transaction = db.Transaction(['new_transaction'], 'readwrite');
                    // access the new_budget object store
                    const transactionObjectStore = transaction.objectStore('new_transaction');
                    // clear all items in your store
                    transactionObjectStore.clear();

                    alert('All saved budget has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}

// listen for app coming back online
window.addEventListener('add-btn, sub-btn', uploadTransaction);