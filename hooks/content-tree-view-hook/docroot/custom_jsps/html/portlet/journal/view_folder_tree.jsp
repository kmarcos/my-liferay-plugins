<%@ include file="/html/portlet/journal/init.jsp" %>

<%
JournalFolder folder = (JournalFolder)request.getAttribute("view_entries.jsp-folder");

String folderImage = (String)request.getAttribute("view_entries.jsp-folderImage");

PortletURL tempRowURL = (PortletURL)request.getAttribute("view_entries.jsp-tempRowURL");
%>

<aui:script use="rl-content-tree-view">

	<portlet:namespace />treeView.addContentFolder({
		id: '<%= String.valueOf(folder.getFolderId()) %>',
		label: '<%= folder.getDescription() %>',
		showCheckbox: '<%= JournalFolderPermission.contains(permissionChecker, folder, ActionKeys.DELETE) || JournalFolderPermission.contains(permissionChecker, folder, ActionKeys.UPDATE) %>',
		rowCheckerId: '<%= String.valueOf(folder.getFolderId()) %>',
		rowCheckerName: '<%= JournalFolder.class.getSimpleName() %>',
		parentFolderId: '<%= String.valueOf(folder.getParentFolderId()) %>',
		expanded : false,
   		fullLoaded : false
	});

</aui:script>