const { response } = require("express");

let budgetDb; 
const req = indexedDB.open('budget', 1);

req.onupgradeneeded = ({ e }) => {
    let budgetDb = e.target.result;
    budgetDb.createObject('newData', { autoIncrement });
};

req.onsuccess = ({ e }) => {
    budgetDb = e.target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
};

req.onerror = ({ e }) => {
    console.log('Looks like there an error ' + e.target.errorCode);
};

function saveRecord (records) {
    const transactions = budgetDb.transactions(['newData', 'readwrite']);
    const store = transactions.objectStore('newData');
    store.add(records);
};

function checkDatabase() {
    const transactions = budgetDb.transactions(['newData', 'readwrite']);
    const store = transactions.objectStore('newData');
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then(response => {
                    return response.json();
                })
                .then((data) => {
                    const transactions = budgetDb.transactions(['newData'], 'readwrite');
                    const store = transactions.objectStore('newData');
                    store.clear();
                });
        }
    };
};

window.addEventListener('online', checkDatabase);