'use strict';

let SQLCommon = module.exports = {};

/**
 * Get a statement JSON object and returns a string like "(key = "value" AND key != "value")"
 * @arg {Object} object - a JSON object with the statements to add in the string
 * @arg {Array} operands - an array with operands that will be used "["AND", "OR", "=", "AND", "!="]"
 * @return {String}
 */
SQLCommon.returnStatement = function(object, operands, callback)
{
  let array = [];
  let statement = '';

  let x = 0;

  let first = function()
  {
    if(Object.keys(object)[x] == 'AND' || Object.keys(object)[x] == 'OR' || Object.keys(object)[x] == 'LIKE' || Object.keys(object)[x] == '=' || Object.keys(object)[x] == '!=' || Object.keys(object)[x] == '<' || Object.keys(object)[x] == '>')
    {
      operands.push(Object.keys(object)[x]);

      SQLCommon.returnStatement(object[Object.keys(object)[x]], operands, function(result)
      {
        array.push(result);

        x += 1;
        
        if(Object.keys(object)[x] == undefined)
        {          
          statement += `(${array.join(` ${operands.slice(-1)} `)})`;

          if(array.length > 1) operands.pop();
          
          callback(statement);
        }
        
        else
        {
          first();
        }
      });
    }

    else
    {
      second();

      operands.pop();

      statement += array.join(` ${operands.slice(-1)} `);
      
      Object.keys(object)[x] == undefined ? callback(statement) : first();
    }
  }

  let second = function()
  {
    array.push(`${object[Object.keys(object)[x]]['key']} ${operands.slice(-1)} "${object[Object.keys(object)[x]]['value']}"`);

    x += 1;

    if(Object.keys(object)[x] != undefined) second();
  }

  first();
}