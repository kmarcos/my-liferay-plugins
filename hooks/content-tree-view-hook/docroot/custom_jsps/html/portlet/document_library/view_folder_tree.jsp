<%@ include file="/html/portlet/document_library/init.jsp" %>

<%
Folder folder = (Folder)request.getAttribute("view_entries.jsp-folder");

String folderImage = (String)request.getAttribute("view_entries.jsp-folderImage");

PortletURL tempRowURL = (PortletURL)request.getAttribute("view_entries.jsp-tempRowURL");
%> 

<aui:script use="rl-content-tree-view">

	<portlet:namespace />treeView.addContentFolder({
		id: '<%=folder.getFolderId() %>',
		label: '<%=folder.getName() %>',
		title: '<%=folder.getName() %>',
		description: '<%=folder.getDescription() %>',
		showCheckbox: '<%= DLFolderPermission.contains(permissionChecker, folder, ActionKeys.DELETE) || DLFolderPermission.contains(permissionChecker, folder, ActionKeys.UPDATE) %>',
		rowCheckerId: '<%= String.valueOf(folder.getFolderId()) %>',
		rowCheckerName: '<%= Folder.class.getSimpleName() %>',
		parentFolderId: '<%= folder.getParentFolderId() %>',
		expanded : false,
   		fullLoaded : false
	});

</aui:script>
