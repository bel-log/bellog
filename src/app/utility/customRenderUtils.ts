import {safeHtml, html} from 'common-tags'

export const compileTemplate = function(templateString, templateVars){
    let args = [...Object.keys(templateVars),
        "return this.html_template`"+templateString +"`;"]
    return new Function(...args).call({html_template: safeHtml}, ...Object.values(templateVars));
}

export const compileTemplateUnsafe = function(templateString, templateVars){
    let args = [...Object.keys(templateVars),
        "return this.html_template`"+templateString +"`;"]
    return new Function(...args).call({html_template: html}, ...Object.values(templateVars));
}