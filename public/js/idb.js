let db;
const request = indexedDB.open('transactions_db', 1);

request.onupgradeneeded = function (event) {
    // save a reference to the database 
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
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
    transactionObjectStore.add(transaction);
}


function uploadTransaction() {
    const transaction = db.Transaction(['new_transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    const getAll = transactionObjectStore.getAll();


    getAll.onsuccess = function () {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api', {
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
                    saveRecord(transaction);
                  });
        }
    };
}


// listen for app coming back online
window.addEventListener('add-btn, sub-btn', uploadTransaction);