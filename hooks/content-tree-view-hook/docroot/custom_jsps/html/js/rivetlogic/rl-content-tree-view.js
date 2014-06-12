AUI.add('rl-content-tree-view', function (A) {
	
	A.namespace('Rivet');

	var BOUNDING_BOX = 'boundingBox';
	var NODE_SELECTOR = '.tree-node';
	var NODE = 'node';
	var PARENT_NODE = 'parentNode';
	var TREE_NODE = 'tree-node';
	 
    A.Rivet.ContentTreeView = A.Base.create('rl-content-tree-view',A.Base, [], {

    	ns : null,
    	repository: null,
    	contentTree: null,
    	contentRoot : null,

        initializer: function () {
        
        	this.ns = this.get('namespace');
        	this.repository = this.get('repositoryId');
        	
        	var instance = this;
        	var boundingBoxId = this.ns + this.get('treeBox');
        	var folderId = this.get('rootFolderId');
        	var folderLabel = this.get('rootFolderLabel');
        	
        	A.one('#'+this.ns+'entriesContainer').append('<div id="'+boundingBoxId+'"></div>');
        	
        	this.contentTree = new A.TreeViewDD(
        		      {
        		        boundingBox: '#'+boundingBoxId,
        		        children: [
        		        	{
        		        		id: folderId,
        		        		label: folderLabel,
        		        		leaf:false,
        		        		expanded: true
        		        	}
        		       	]
        		      }
        		    ).render();
        	
        	this.contentRoot = this.contentTree.getNodeById(folderId);
        	this.contentRoot.set('isFolder', true);
        	this.contentRoot.set('fullLoaded', true);
        	
        	var boundingBox = this.contentTree.get(BOUNDING_BOX);        	
        	boundingBox.delegate('click', A.bind(instance._clickRivetHandler,this), NODE_SELECTOR);
        	this.contentTree.on('drop:hit', A.bind(instance._dropHitRivetHandler,this));
        	//this.contentTree.on('drop:over', A.bind(instance._dropOverRivetHandler,this));

        },
        
        addContentFolder: function(newNodeConfig, parentNode){
        	
        	this._addContentNode(newNodeConfig, parentNode, true, false);
        },
        
        addContentEntry: function(newNodeConfig, parentNode){
        	
        	this._addContentNode(newNodeConfig, parentNode, false, true);
        },
        
        _dropHitRivetHandler: function(event){
        	var dragNode = event.drag.get(NODE).get(PARENT_NODE);
            var dragTreeNode = dragNode.getData(TREE_NODE);
            var dropNode = event.drop.get(NODE).get(PARENT_NODE);
            var dropTreeNode = dropNode.getData(TREE_NODE);

            this._moveContentNode(dragTreeNode,dropTreeNode);
            	
        },
        
        _dropOverRivetHandler: function(event){
        	var dropNode = event.drop.get(NODE).get(PARENT_NODE);
        	console.log('dropNode');console.log(dropNode);
            var dropTreeNode = dropNode.getData(TREE_NODE);
            console.log('dropTreeNode');console.log(dropTreeNode);
        },
        
        _moveContentNode: function(node, target){
        	
        	console.log('target');console.log(target);
        	if (!this._isFolder(target)){
        		console.log("is a leaf getting parent");
        		target = target.get(PARENT_NODE);
        	}
        	console.log('target');console.log(target);
        	
        	
        	var parentNode = node.get(PARENT_NODE);
        	console.log('parentNode');console.log(parentNode);
        	
        	if (parentNode.get('id') != target.get('id')){
        		
	    		console.log(" moving "+node.get('id')+"-"+node.get('label'));
	            console.log(" to "+target.get('id')+"-"+target.get('label'));
	        	
	        	if (this._isFolder(node)){
	        		this._moveContentFolder(node, target);
	        	}
	        	else{
	        		this._moveContentEntry(node, target);
	        	}
        	}
        	else{
        		console.log("no moved because is the same target folder");
        	}
        	        	
        },
        
        _moveContentFolder: function(folder, target){
        	console.log("folder id "+folder.get('id'));
        	console.log("target id "+target.get('id'));
        	console.log("repository id "+this.repository);
        	Liferay.Service(
        			'/dlapp/move-folder',
        			{
        				repositoryId: this.repository,
        				folderId: folder.get('id'),
        				parentFolderId: target.get('id'),
        				serviceContext: JSON.stringify(
                            {
                            	scopeGroupId: this.repository
                            }
                        )
        			}
        	);
        },
        
        _moveContentEntry: function(entry, target){
        	console.log("entry id "+entry.get('id'));
        	console.log("target id "+target.get('id'));
        	console.log("repository id "+this.repository);
        	
        	Liferay.Service(
        			'/dlapp/move-file-entry',
        			{
        				repositoryId: this.repository,        				
        				fileEntryId: entry.get('id'),
        				newFolderId: target.get('id'),
        				serviceContext: JSON.stringify(
                            {
                            	scopeGroupId: this.repository
                            }
                        )
        			}
        	);
        },
        
        _clickRivetHandler: function(event){

        	event.stopPropagation();

        	var treeNode = this.contentTree.getNodeById(event.currentTarget.attr('id'));
 
        	if (treeNode && !(treeNode.get('fullLoaded'))){
        		this._getChildren(treeNode, this);
        	}
        },
        
       _addContentNode: function(newNodeConfig, parentNode, isFolder, fullLoaded){       	  
        	var newNode = this.contentRoot.createNode(
			  {
			    id: newNodeConfig.id,
			    label: newNodeConfig.label,
			    leaf:!isFolder,
        		expanded: false
			  }
			);
        	
        	newNode.set('isFolder', isFolder);
        	newNode.set('fullLoaded', fullLoaded);
        	
        	//newNode.on('drop:hit', A.bind(this ._dropHitRivetHandler,this));
        	
        	if (parentNode === undefined){
        		parentNode = this.contentRoot;
        	}
        	      	
        	parentNode.appendChild(newNode);
        },
        
        _getChildren: function(treeNode, instance) {        	
        	   
        	// Get folders children of this folder
        	Liferay.Service(
           			'/dlapp/get-folders',
           			{
           				repositoryId: instance.repository,
           				parentFolderId: treeNode.get('id')
           			},
           			function(folders) {
           				A.each(folders, function(item, index, collection){    

           					instance.addContentFolder({
           						id : item.folderId.toString(),
           						label: item.name
           					},treeNode);
           					
           					treeNode.expand();
           				});
           			}
           		);
        	
        	// Get entries children of this folder
        	Liferay.Service(
        			'/dlapp/get-file-entries',
        			{
        				repositoryId: instance.repository,
        				folderId: treeNode.get('id')
        			},
        			function(entries) {
        				
        				A.each(entries, function(item, index, collection){
        					
        					instance.addContentEntry({
        						id : item.fileEntryId.toString(),
        						label: item.title
        					},treeNode);
        					
        					treeNode.expand();
        				});
        			}
        	);
        	   
        	treeNode.set('fullLoaded', true);
        },
        
        _isFolder: function(treeNode){
        	result = false;
        	if (treeNode){
        		result = treeNode.get('isFolder');
        	}
        	return result;
        }
    
    }, {
        ATTRS: {

        	namespace:{
        		value: null
        	},
        	treeBox:{
        		value: null
        	},
        	repositoryId:{
        		value: null
        	},
            rootFolderId: {
                value: null
            },
            rootFolderLabel:{
            	value: null
            }
        }
    });
 
}, '1.0.0', {
    requires: ['aui-tree-view','json','liferay-portlet-url']
});