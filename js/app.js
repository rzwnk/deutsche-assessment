


const createNote = (ifSubnote, noteText, noteParent) => {
    const { value } = typeof ifSubnote === 'undefined' ? document.getElementById("newNoteText") : { value: noteText };
    if (!value) return;
    if(typeof ifSubnote === 'undefined')allNotes.push({noteText: value, childNotes: []});


    const cont = typeof ifSubnote === 'undefined'? document.getElementsByClassName("notes-container")[0] : noteParent;
    const container = createElementAndAppendTo('div', '', {class: 'note-parent'}, cont);
    const note = createElementAndAppendTo('div', '', { class: 'note' }, container, true);
    createElementAndAppendTo('div', '', { class: 'childNotes' }, container);
    const noteTextDiv = createElementAndAppendTo('div', value, { class: 'notes-text' }, note);
    const actionsContainer = createElementAndAppendTo('div', '', {}, note);
    createElementAndAppendTo('span', 'Delete', { class: 'deleteNote action' }, actionsContainer);
    createElementAndAppendTo('span', 'New Note', { class: 'createSubNote action' }, actionsContainer);
    document.getElementById("newNoteText").value = "";
    typeof ifSubnote !== 'undefined' && document.getElementById('newNoteText').focus();
    return container;
}


//creating element and appending that
function createElementAndAppendTo(type, textNode, attributesObject, parentNode, prepend) {
    var el = document.createElement(type);
    el.append(document.createTextNode(textNode));

    if (prepend) parentNode.prepend(el);
    else parentNode.append(el);
    for (let k in attributesObject) {
        el.setAttribute(k, attributesObject[k]);
    }
    return el;
}

//Delete node
function manageNode(e) {
    const [ parentArr, loc ] = parseEventPath(e.composedPath());
    var tgt = e.target;
    if (tgt.classList.contains('deleteNote')) {
        debugger;
        const noteP = tgt.parentNode.parentNode.parentNode;
        noteP.parentNode.removeChild(noteP);
        parentArr.splice(loc, 1);
        document.getElementById('newNoteText').focus();
    }
    if (tgt.classList.contains('createSubNote')) {
        const noteText = prompt('input noteText');
        parentArr[loc].childNotes.push({noteText, childNotes: []});
        const noteParent = tgt.parentNode.parentNode.parentNode;
        const childNotesDiv = noteParent.getElementsByClassName('childNotes')[0];
        createNote(true, noteText, childNotesDiv);
    }

    if (tgt.classList.contains('notes-text')) {
        const noteText = prompt('input noteText');
        parentArr[loc].noteText = noteText;
        tgt.replaceChild(document.createTextNode(noteText), tgt.firstChild);
        
        const childNotesDiv = noteParent.getElementsByClassName('childNotes')[0];
        createNote(true, noteText, childNotesDiv);
    }
}
document.onkeypress = function (evt) {
    evt = evt || window.event;
    if (evt.keyCode == 13) {
        createNote();
    }
};
document.getElementsByClassName('createButton')[0].addEventListener('click', ()=>{createNote()});
document.getElementsByClassName('notes-container')[0].addEventListener('click', manageNode);
window.onload = () => {
    document.getElementById('newNoteText').focus();
};


// window.onbeforeunload = function () {
//     alert('what the fuck bro')
//     return 'Are you really want to perform the action?';
//    }

// window.addEventListener('beforeunload', function (e) {
//     saveToLocalStorage();
// });

window.addEventListener('unload', function (e) {
    saveToLocalStorage();
});


function createNotesFromArray(arr, parentNode) {
    if (!arr.length) return;
    arr.forEach(element => {
        let node = null;
        if (!parentNode) {
            node = createNote(true, element.noteText, document.getElementsByClassName('notes-container')[0]);
        }
        else {
            const childNotesDiv = parentNode.getElementsByClassName('childNotes')[0];
            node = createNote(true, element.noteText, childNotesDiv)
        }
        if (element.childNotes && element.childNotes.length) {
            createNotesFromArray(element.childNotes, node);
        }
    });
}


window.onload = function loadFromLocalStorage() {
    allNotes = localStorage.getItem("allNotes") ? JSON.parse(localStorage.getItem("allNotes")) :[];
    if(allNotes.length)createNotesFromArray(allNotes);
}



function saveToLocalStorage () {
    localStorage.setItem('allNotes', JSON.stringify(allNotes));
}


function parseEventPath(path) {
    let containerArray = allNotes;
    for (let i = path.length-6; i >= 0; i--) {
        const element = path[i];
        if (element.classList.contains('note-parent') ){
            const index = getIndexOflement(element);
            const noteRef = containerArray[index];
            
            if(i!==3 && i!==2){
                containerArray = noteRef.childNotes;
            }
            else {
                return [containerArray, index];
            }

        }
    }
} 


function getIndexOflement(elem){
    var  i= 0;
    while((elem=elem.previousSibling)!=null) ++i;
    return (i-1);
}


function performSearch () {
    const value = document.getElementById('searchtext').value;

    const matched = getMatchedNotes(allNotes, value);
    console.log('matcheddd', matched);
    document.getElementsByClassName('notes-container')[0].innerHTML = '';
    createNotesFromArray( value ? matched : allNotes );
    document.getElementById('searchtext').focus()
}


function getMatchedNotes (arr,str) {
    let matched = [];

    arr.forEach(item=>{
        if((item.noteText || "").indexOf(str)!==-1){
            matched.push({noteText: item.noteText || '', childNotes:[]})
        }
        if(item.childNotes && item.childNotes.length){
            matched = matched.concat(getMatchedNotes(item.childNotes, str));
        }
    })
    return matched;
}