(function() {
/**
 * Modelify.js 1.0.0
 * Created by Elijah Mock on 11/27/2020
 * https://github.com/92Eli/modelify
 * 
 * Creates pop up modals that resolve to promises
 * 
 */

//Todo: make if you click outside of modal (in z el), modal closes (if closable)

let modalOpen = false; // to start
let modalsOpen = 0;
function modalOpened() {
    modalsOpen++;
}
function modalClosed() {
    modalOpen = (--modalsOpen === 0) ? false : true;
    if (!modalOpen) {
        try {
            document.body.removeChild(document.querySelector(".modelify-bg"));
        } catch (e) {
            console.error("Modelify error:", e); // should not run
        }
    }
}
function maybeAddBg() {
    if (modalsOpen <= 1) {
        // need bg
        const z = document.createElement("div");
        z.classList.add("modelify-bg");
        document.body.appendChild(z);
    }
}

function info(msg, bgColor) {
    modalOpened();
    const a = document.createElement("div");
    const c = document.createElement("div");
    const m = document.createElement("p");
    
    a.classList.add("modelify");
    c.classList.add("modelify-close");
    m.classList.add("main");

    if (bgColor) a.style.backgroundColor = bgColor;

    m.textContent = msg;

    const p = new Promise((res, rej) => {
        c.addEventListener("click", () => {
            document.body.removeChild(a);
            //document.body.removeChild(z);
            res("closed");
            modalClosed();
        });
    });

    a.appendChild(c);
    a.appendChild(m);
    document.body.appendChild(a);
    maybeAddBg();

    return p;
}

/*
options {
    smoothClose: true | false
    bgColor: "rgb()" | "#HEX"
    closable: true | false
    // ONLY AVAILABLE FOR Modelify.choose() :
    choiceColors: []
}
*/
function basicPrompt(msg, option1="No", option2="Yes", options) {
    modalOpened();
    const a = document.createElement("div");
    const c = document.createElement("div");
    const m = document.createElement("p");
    const ops = document.createElement("div");
    const o1 = document.createElement("div");
    const o2 = document.createElement("div");
    
    a.classList.add("modelify");
    c.classList.add("modelify-close");
    m.classList.add("main");
    ops.classList.add("ops-container");
    o1.classList.add("option");
    o1.classList.add("pushy__btn","pushy__btn--red");
    o2.classList.add("option");
    o2.classList.add("pushy__btn","pushy__btn--green");

    let smoothly = false,
        closable = true;;
    if (options != undefined) {
        if (options.hasOwnProperty("bgColor")) a.style.backgroundColor = options.bgColor;
        //if (options == undefined || !options.hasOwnProperty("smooth")) options.smooth = false;
        if (options.hasOwnProperty("smoothClose")) smoothly = options.smoothClose;
        if (options.hasOwnProperty("closable")) closable = options.closable;
    }

    m.textContent = msg;
    o1.textContent = option1;
    o2.textContent = option2;

    function clearModal(smooth, noDelay) {
        if (!smooth) {
            if (noDelay == true) {
                // no delay
                document.body.removeChild(a);
                modalClosed();
            } else {
                setTimeout(() => {
                    document.body.removeChild(a);
                    modalClosed();
                }, 100); // let them see popdown first
            }
        } else {
            a.classList.add("zoom-out");
            // todo here
            z.classList.add("fade-out");
            setTimeout(() => {
                document.body.removeChild(a);
                modalClosed();
            }, 250); // let them see zoom effect
        }
    }

    const p = new Promise((res, rej) => {
        c.addEventListener("click", () => {
            clearModal(smoothly, true);
            rej("closed");
        });
        o1.addEventListener("click", () => {
            clearModal(smoothly);
            res(0); // 0th op
        });
        o2.addEventListener("click", () => {
            clearModal(smoothly);
            res(1); // 0st op
        });
    });

    if (closable) a.appendChild(c);
    a.appendChild(m);
    ops.appendChild(o1);
    ops.appendChild(o2);
    a.appendChild(ops);
    document.body.appendChild(a);
    maybeAddBg();

    return p;
}

function choose(msg, choices, options) {
    modalOpened();
    const a = document.createElement("div");
    const c = document.createElement("div");
    const m = document.createElement("p");
    const ops = document.createElement("div");
    
    a.classList.add("modelify");
    c.classList.add("modelify-close");
    m.classList.add("main");
    ops.classList.add("ops-container");

    
    
    let smoothly = false,
        closable = true,
        choiceColors = [];
    if (options != undefined) {
        if (options.hasOwnProperty("bgColor")) a.style.backgroundColor = options.bgColor;
        if (options.hasOwnProperty("smoothClose")) smoothly = options.smoothClose;
        if (options.hasOwnProperty("closable")) closable = options.closable;
        if (options.hasOwnProperty("choiceColors") && Array.isArray(choiceColors)) choiceColors = options.choiceColors;
    }
    if (!Array.isArray(choices)) choices = []; // idk why you'd do this (throw?)

    m.textContent = msg;

    function clearModal(smooth, noDelay) {
        if (!smooth) {
            if (noDelay == true) {
                // no delay
                document.body.removeChild(a);
                modalClosed();
            } else {
                setTimeout(() => {
                    document.body.removeChild(a);
                    modalClosed();
                }, 100); // let them see popdown first
            }
        } else {
            a.classList.add("zoom-out");
            if (modalsOpen == 1) {
                // last modal
                document.querySelector(".modelify-bg").classList.add("fade-out");
            }
            setTimeout(() => {
                document.body.removeChild(a);
                modalClosed();
            }, 250); // let them see zoom effect
        }
    }

    const p = new Promise((res, rej) => {
        c.addEventListener("click", () => {
            clearModal(smoothly, true);
            rej("closed");
        });
        //for (const oTitle in choices) { // have to loop here where we have access to res()
        for (let i = 0; i < choices.length; i++) { // have to loop here where we have access to res()
            const o = document.createElement("div");
            o.classList.add("option");
            o.classList.add("pushy__btn","pushy__btn--red");
            
            o.textContent = choices[i];
            if (choiceColors[i] != undefined) {
                o.style.backgroundColor = choiceColors[i];
            }

            o.addEventListener("click", () => {
                clearModal(smoothly);
                res(choices[i]); // resolve with name
            });
            
            ops.appendChild(o);
        }
    });

    if (closable) a.appendChild(c);
    a.appendChild(m);
    a.appendChild(ops);
    document.body.appendChild(a);
    maybeAddBg();

    return p;
}



window.Modelify = {
    info: info,
    prompt: basicPrompt,
    choose: choose,
    modalIsOpen: function () { return modalOpen; }
}

})(); //IIFE!