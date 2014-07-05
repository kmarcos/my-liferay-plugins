<%@ include file="/html/portlet/document_library/init.jsp" %>

<%
FileEntry fileEntry = (FileEntry)request.getAttribute("view_entries.jsp-fileEntry");

FileVersion latestFileVersion = fileEntry.getFileVersion();

if ((user.getUserId() == fileEntry.getUserId()) || permissionChecker.isCompanyAdmin() || permissionChecker.isGroupAdmin(scopeGroupId) || DLFileEntryPermission.contains(permissionChecker, fileEntry, ActionKeys.UPDATE)) {
	latestFileVersion = fileEntry.getLatestFileVersion();
}

DLFileShortcut fileShortcut = (DLFileShortcut)request.getAttribute("view_entries.jsp-fileShortcut");
PortletURL tempRowURL = (PortletURL)request.getAttribute("view_entries.jsp-tempRowURL");

String rowCheckerName = FileEntry.class.getSimpleName();
long rowCheckerId = fileEntry.getFileEntryId();
boolean isFileShortcut = false;
long parentFolderId = fileEntry.getFolderId();

if (fileShortcut != null) {
	rowCheckerName = DLFileShortcut.class.getSimpleName();
	rowCheckerId = fileShortcut.getFileShortcutId();
	isFileShortcut = true;
	parentFolderId = fileShortcut.getFolderId();
}
%>

<%@ include file="/html/portlet/document_library/preview_query.jspf" %>

<aui:script use="rl-content-tree-view">

<portlet:namespace />treeView.addContentEntry({
	id : '<%= latestFileVersion.getFileEntryId() %>',
	label: '<%= latestFileVersion.getTitle() %>',
	shortcut: <%=isFileShortcut %>,
	showCheckbox: '<%= DLFileEntryPermission.contains(permissionChecker, fileEntry, ActionKeys.DELETE) || DLFileEntryPermission.contains(permissionChecker, fileEntry, ActionKeys.UPDATE) %>',
	rowCheckerId: '<%= String.valueOf(rowCheckerId) %>',
	rowCheckerName: '<%= rowCheckerName %>',
	parentFolderId: '<%= parentFolderId %>',
	previewURL:'<%= previewFileURL %>',
	viewURL: '<%= tempRowURL %>'
});
</aui:script>