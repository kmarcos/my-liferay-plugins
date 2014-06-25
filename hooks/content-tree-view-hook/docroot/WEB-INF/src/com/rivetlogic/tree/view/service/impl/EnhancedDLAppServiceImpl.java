/**
 * Copyright (c) 2000-2013 Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.rivetlogic.tree.view.service.impl;

import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.exception.SystemException;
import com.liferay.portal.kernel.repository.model.FileEntry;
import com.liferay.portal.kernel.repository.model.Folder;
import com.liferay.portal.security.permission.ActionKeys;
import com.liferay.portlet.documentlibrary.service.DLAppServiceUtil;
import com.rivetlogic.tree.view.model.DLFileEntry;
import com.rivetlogic.tree.view.model.DLFolder;
import com.rivetlogic.tree.view.service.base.EnhancedDLAppServiceBaseImpl;

import java.util.ArrayList;
import java.util.List;

/**
 * The implementation of the enhanced d l app remote service.
 * 
 * <p>
 * All custom service methods should be put in this class. Whenever methods are
 * added, rerun ServiceBuilder to copy their definitions into the
 * {@link com.rivetlogic.tree.view.service.EnhancedDLAppService} interface.
 * 
 * <p>
 * This is a remote service. Methods of this service are expected to have
 * security checks based on the propagated JAAS credentials because this service
 * can be accessed remotely.
 * </p>
 * 
 * @author rivetlogic
 * @see com.rivetlogic.tree.view.service.base.EnhancedDLAppServiceBaseImpl
 * @see com.rivetlogic.tree.view.service.EnhancedDLAppServiceUtil
 */
public class EnhancedDLAppServiceImpl extends EnhancedDLAppServiceBaseImpl {
    /*
     * NOTE FOR DEVELOPERS:
     * 
     * Never reference this interface directly. Always use {@link
     * com.rivetlogic.tree.view.service.EnhancedDLAppServiceUtil} to access the
     * enhanced d l app remote service.
     */

    public List<Object> getFoldersAndFileEntriesAndFileShortcuts(long repositoryId, long folderId, int status,
            boolean includeMountFolders, int start, int end) throws PortalException, SystemException {

        List<Object> items = DLAppServiceUtil.getFoldersAndFileEntriesAndFileShortcuts(repositoryId, folderId, status,
                includeMountFolders, start, end);

        List<Object> results = new ArrayList<Object>();

        for (Object o : items) {

            if (o instanceof Folder) {
                Folder folder = (Folder) o;
                DLFolder dlFolder = new DLFolder(folder);
                dlFolder.setDeletePermission(folder.containsPermission(getPermissionChecker(), ActionKeys.DELETE));
                dlFolder.setUpdatePermission(folder.containsPermission(getPermissionChecker(), ActionKeys.UPDATE));
                results.add(dlFolder);
            }
            if (o instanceof FileEntry) {
                FileEntry fileEntry = (FileEntry) o;
                DLFileEntry dlFileEntry = new DLFileEntry(fileEntry);
                dlFileEntry
                        .setDeletePermission(fileEntry.containsPermission(getPermissionChecker(), ActionKeys.DELETE));
                dlFileEntry
                        .setUpdatePermission(fileEntry.containsPermission(getPermissionChecker(), ActionKeys.UPDATE));
                results.add(dlFileEntry);
            }
        }

        return results;
    }
}