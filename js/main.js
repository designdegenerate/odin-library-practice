let myLibrary = [];

function Book(title, author, pageCount, hasRead, hash) {
    this.title = title;
    this.author = author;
    this.pageCount = pageCount;
    this.hasRead = hasRead;
    this.hash = hash;
}

function getBookIndex(hash){
    const rootElement = document.querySelector(`[data-library="${hash}"]`);
    const libIndex = myLibrary.findIndex(book => book.hash == hash);
    return libIndex;
}

function pushToLocalStorage(book) {

  window.localStorage
    .setItem(book.hash, 
      JSON.stringify(book));

}

function createHTML(book) {
    const ul = document.querySelector('#bookLibrary');
    const li = document.createElement('li');

    const topDiv = document.createElement('div');
    const h2 = document.createElement('h2');
    const h3 = document.createElement('h3');
    const pgCount = document.createElement('p');
    const pgCountInner = document.createElement('span');

    const botDiv = document.createElement('div');
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    const removeBtn = document.createElement('button');

    /* 
     * Match data from book object to
     * elements, add necessary attributes,
     * and append them together correctly
     */

    li.setAttribute('data-library', book.hash)

    // Top Div first

    h2.innerText = book.title;
    h3.innerText = book.author;

    topDiv.appendChild(h2);
    topDiv.appendChild(h3);

    pgCount.setAttribute('class', 'pageCount');
    pgCountInner.innerText = book.pageCount;
    pgCount.appendChild(pgCountInner);
    pgCount.append(" pages");

    topDiv.appendChild(pgCount);

    // Bot Div next
    
    checkbox.setAttribute('type', 'checkbox');

    if (book.hasRead) {
        checkbox.setAttribute('checked', '');
    }

    checkbox.addEventListener('change', function(event){
        if (this.hasAttribute('checked')) {
            this.removeAttribute('checked');

            //Get the hash of the book
            const hash = 
                this
                .parentElement
                .parentElement
                .parentElement
                .getAttribute('data-library');

            //Extract out the book from
            //local storage, make change
            //and push back in
            const book = JSON.parse(window.localStorage.getItem(hash));
            book.hasRead = false;
            pushToLocalStorage(book);

            //Also Write to the array
            const bookIndex = getBookIndex(hash);
            myLibrary[bookIndex].hasRead = false

        } else {
            this.setAttribute('checked', '');

            const hash = 
                this
                .parentElement
                .parentElement
                .parentElement
                .getAttribute('data-library');
            
            const book = JSON.parse(window.localStorage.getItem(hash));
            book.hasRead = true;
            pushToLocalStorage(book);

            //Also Write to the array
            const bookIndex = getBookIndex(hash);
            myLibrary[bookIndex].hasRead = true
        }
    });

    label.appendChild(checkbox);
    label.append(' Read');
    botDiv.appendChild(label);

    removeBtn.innerText = "Remove";
    removeBtn.addEventListener('click', 
        function(event){ 
            //Remove content from DOM and local storage
            const rootElement = this.parentElement.parentElement;
            const hash = rootElement.getAttribute('data-library');
            const bookIndex = getBookIndex(hash);

            rootElement.remove();
            window.localStorage.removeItem(hash);
            myLibrary.splice(bookIndex, 1);
        })
    botDiv.appendChild(removeBtn);

    //Place into DOM
    li.appendChild(topDiv);
    li.appendChild(botDiv);
    ul.appendChild(li);

}

function addBookToLibrary(title, author, pageCount, hasRead) {

    /*
     * Generate a hash of the book, to easily reference
     * the book across the DOM, array, and localstorage
     */

    //https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript

    const getHash = function(str, seed = 0) {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
        h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1>>>0);
    };

    const data = title + author + pageCount
    hashHex = getHash(data);

    const book = new Book(title, author, pageCount, hasRead, hashHex);

    myLibrary.push(book);
    pushToLocalStorage(book);
    createHTML(book);

}

document.querySelector('#hasRead').addEventListener('change', function(event){
    if (this.hasAttribute('checked')) {
        this.removeAttribute('checked');
    } else {
        this.setAttribute('checked', '');
    }
})

document.querySelector('form').addEventListener('submit', function(event){
    event.preventDefault();

    const readStatus = document.querySelector('#hasRead')
    let hasRead;
    
    readStatus.hasAttribute('checked') 
        ? hasRead = true : hasRead = false;

    addBookToLibrary(
        document.querySelector('#title').value,
        document.querySelector('#author').value,
        document.querySelector('#pageCount').value,
        hasRead
    );
   
    document.querySelector('form').reset();

    if (readStatus.hasAttribute('checked')) {
        readStatus.removeAttribute('checked');
    }

});

( () => {

    /*reads from local storage and sends every object to addBookToLibrary*/
    //window.localStorage.key

    /*on start, read from local storage,
    convert strings back to json,
    from json match metadata,
    loop over each item to create each item

    */

  for (var i = localStorage.length - 1; i >= 0; i--) {

    //Get list of key names
    let key = localStorage.key(i);

    //Convert key string back to JSON
    const book = JSON.parse(localStorage.getItem(key));

    myLibrary.push(book);
    createHTML(book);

  }

})();