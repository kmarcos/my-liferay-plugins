AUI.add('rl-content-tree-view', function (A) {
	
	A.namespace('Rivet');

	var BOUNDING_BOX = 'boundingBox';
	var NODE_SELECTOR = '.tree-node';
	 
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

        },
        
        addContentFolder: function(newNodeConfig, parentNode){
        	
        	this._addContentNode(newNodeConfig, parentNode, true, false);
        },
        
        addContentEntry: function(newNodeConfig, parentNode){
        	
        	this._addContentNode(newNodeConfig, parentNode, false, true);
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