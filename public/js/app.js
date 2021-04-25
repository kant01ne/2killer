const copyButton = document.getElementById("copyButton");

if (copyButton) {
    copyButton.addEventListener("click", function() {
        copyToClipboard(document.getElementById("copyTarget"));
    });
}


const copyButton2 = document.getElementById("copyButton2");

if (copyButton2) {
    copyButton2.addEventListener("click", function() {
        copyToClipboard(document.getElementById("copyTarget2"));
    });
}


function copyToClipboard(elem) {
	  // create hidden text element, if it doesn't already exist
    var targetId = "_hiddenCopyText_";
    var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
    var origSelectionStart, origSelectionEnd;
    if (isInput) {
        // can just use the original source element for the selection and copy
        target = elem;
        origSelectionStart = elem.selectionStart;
        origSelectionEnd = elem.selectionEnd;
    } else {
        // must use a temporary form element for the selection and copy
        target = document.getElementById(targetId);
        if (!target) {
            var target = document.createElement("textarea");
            target.style.position = "absolute";
            target.style.left = "-9999px";
            target.style.top = "0";
            target.id = targetId;
            document.body.appendChild(target);
        }
        target.textContent = elem.textContent;
    }
    // select the content
    var currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);
    
    // copy the selection
    var succeed;
    try {
    	  succeed = document.execCommand("copy");
    } catch(e) {
        succeed = false;
    }
    // restore original focus
    if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
    }
    
    if (isInput) {
        // restore prior selection
        elem.setSelectionRange(origSelectionStart, origSelectionEnd);
    } else {
        // clear temporary content
        target.textContent = "";
    }
    document.getElementById("copied").style["display"] = "flex";
    setTimeout(() => document.getElementById("copied").style["display"] = "none", 2000);
    return succeed;
}

var cssTypingElements = $(".css-typing-hidden");

async function typing () {
    for (let i = 0; i < cssTypingElements.length; i++) {
        const content = cssTypingElements[i].innerHTML
        var ele = '<span>' + content.split('').join('</span><span>') + '</span>';
      

        $(ele).hide().appendTo(`.css-typing:eq(${i})`).each(function (i) {
            $(this).delay(70 * i).css({
                display: 'inline',
                opacity: 0
            }).animate({
                opacity: 1
            }, 70);
        });
        await new Promise(r => setTimeout(r, 5000));
      }
}

typing();