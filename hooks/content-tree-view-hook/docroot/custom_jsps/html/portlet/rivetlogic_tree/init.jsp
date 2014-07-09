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

<%-- RivetLogic Custom BEGINS --%>
<%
String TREE_VIEW = "tree";
if (themeDisplay.isSignedIn()){
    int newDisplayIdx = displayViews.length;
	String[] displayViewsAugmented = Arrays.copyOf(displayViews, displayViews.length + 1);   
	displayViewsAugmented[newDisplayIdx] = TREE_VIEW;
	displayViews = displayViewsAugmented;
}
%>

<aui:script>                   
AUI().applyConfig({
    groups : {
        'rivet-custom' : {
            base : '/html/js/rivetlogic/',
            async : false,
            modules : {
                'rl-content-tree-view': {
                        path: 'rl-content-tree-view.js',
                        requires: [
                            'aui-tree-view'
                        ]
                },

            }
        }
    }
});
</aui:script>

<aui:script use="aui-base">
var <portlet:namespace />treeView;
</aui:script>

<%-- RivetLogic Custom ENDS --%>