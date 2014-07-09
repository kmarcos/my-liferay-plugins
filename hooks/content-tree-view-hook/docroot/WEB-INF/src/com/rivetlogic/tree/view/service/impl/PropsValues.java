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

package com.rivetlogic.tree.view.service.impl;

import com.liferay.portal.kernel.util.PropsKeys;
import com.liferay.portal.kernel.util.PropsUtil;

/**
 * Some constants copied from PropsValues in portal-impl. These constants are
 * used to generate preview link
 * 
 * @author rivetlogic
 * 
 */
final public class PropsValues {

    private PropsValues() {

    }

    /**
     * Container for audio
     */
    public static final String[] DL_FILE_ENTRY_PREVIEW_AUDIO_CONTAINERS = PropsUtil
            .getArray(PropsKeys.DL_FILE_ENTRY_PREVIEW_AUDIO_CONTAINERS);
    /**
     * Container for video
     */
    public static final String[] DL_FILE_ENTRY_PREVIEW_VIDEO_CONTAINERS = PropsUtil
            .getArray(PropsKeys.DL_FILE_ENTRY_PREVIEW_VIDEO_CONTAINERS);

}
