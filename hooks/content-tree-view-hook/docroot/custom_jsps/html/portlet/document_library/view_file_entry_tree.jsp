<%--
/**
 * Copyright (C) 2005-2014 Rivet Logic Corporation.
 * 
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation; version 3 of the License.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 51
 * Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 */
--%>

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
	previewURL:'<%= Validator.isNotNull(previewFileURL) ? previewFileURL : themeDisplay.getPathThemeImages() + "/file_system/large/"+DLUtil.getGenericName(fileEntry.getExtension())+".png" %>',
	viewURL: '<%= tempRowURL %>'
});
</aui:script>