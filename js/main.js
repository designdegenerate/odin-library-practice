let myLibrary = [];

class Book {

    constructor(title, author, pageCount, hasRead, hash) {
        this.title = title;
        this.author = author;
        this.pageCount = pageCount;
        this.hasRead = hasRead;
        this.hash = hash;
    }

    generateHash() {
        if (this.hash !== undefined) {
            console.log('This book already has a hash');
            return;
        }

        //https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
        const getHash = (str, seed = 0) => {
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
    
        const data = this.title + this.author + this.pageCount;
        this.hash = getHash(data);
        return
    }

    pushToLocalStorage = () => {

        window.localStorage
          .setItem(this.hash, 
            JSON.stringify(this));
      
      }

    createHTML() {

        const getBookIndex = () => {
            const rootElement = document.querySelector(`[data-library="${this.hash}"]`);
            const libIndex = myLibrary.findIndex(book => this.hash == hash);
            return libIndex;
        }
    
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

        li.setAttribute('data-library', this.hash)

        // Top Div first

        h2.innerText = this.title;
        h3.innerText = this.author;

        topDiv.appendChild(h2);
        topDiv.appendChild(h3);

        pgCount.setAttribute('class', 'pageCount');
        pgCountInner.innerText = this.pageCount;
        pgCount.appendChild(pgCountInner);
        pgCount.append(" pages");

        topDiv.appendChild(pgCount);

        // Bot Div next
        
        checkbox.setAttribute('type', 'checkbox');

        if (this.hasRead) {
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

    addBookToLibrary() {
    
        myLibrary.push(this);
        this.pushToLocalStorage(this);
        this.createHTML(this);
    
    }
}

document.querySelector('#hasRead').addEventListener('change', function(event){
    if (this.hasAttribute('checked')) {
        this.removeAttribute('checked');
    } else {
        this.setAttribute('checked', '');
    }
})

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();

    const readStatus = document.querySelector('#hasRead')
    let hasRead;
    
    readStatus.hasAttribute('checked') 
        ? hasRead = true : hasRead = false;
    
    const book = new Book(
        document.querySelector('#title').value,
        document.querySelector('#author').value,
        document.querySelector('#pageCount').value,
        hasRead
    )

    book.generateHash();
    book.addBookToLibrary();
   
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
    const book= JSON.parse(localStorage.getItem(key))

    //And then, turn that object back into a class
    const bookClass = new Book(
        book.title,
        book.author,
        book.pageCount,
        book.hash
    );

    myLibrary.push(bookClass);
    bookClass.createHTML();

    
  }

})();