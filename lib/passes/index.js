var scope = require('../scope')
  , types = require('../types')
  , ast = require('../ast')
  ;


var enter = function(node){
  if (node instanceof ast.MethodStatement) {
    if (!(node.extern)) {
      // Ah!  This means the node.nat may be incorrect (false negative).
      // Look for the case where .nat should be set to true:
      // >> non-externed method declared in very same scope as its non-externed struct
      console.log("\n\n\n\n\n===========================================\nNODE:");
      console.log(node.name);
      console.log(node.extern);
      console.log(node.nat);
      var relatedTypeName = node.args[0][1].name;
      // var relatedTypeScope = node.scope.search('struct', relatedTypeName);
      var relatedType = node.args[0][1];
      console.log(relatedType);
      console.log("*******************\n\n\n\n\n\n\n");
      if (node.scope.search('struct', relatedTypeName) == node.scope) {
        node.nat = true;
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
        console.log("********************");
      }
    }
  }
}
var exit = function(){}



exports.runAll = function(node) {
  // Build scope information and attach to the ast nodes
  scope.build(node, true);

  // Calculate type information
  types.realize(node);

  ast.traverse(node, enter, exit);

};
