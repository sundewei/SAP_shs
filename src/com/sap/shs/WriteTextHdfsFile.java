package com.sap.shs;

import com.sap.ext.shield.LogSender;
import com.sap.hadoop.conf.ConfigurationManager;
import com.sap.hadoop.conf.IFileSystem;
import org.apache.commons.io.IOUtils;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.*;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: I827779
 * Date: 2/12/13
 * Time: 9:02 PM
 * To change this template use File | Settings | File Templates.
 */
public class WriteTextHdfsFile extends BaseServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(true);
        ConfigurationManager configurationManager =
                ((LoginPass) session.getAttribute(ShsContext.LOGIN_PASS)).getConfigurationManager();
        String hdfsFilename = request.getParameter("hdfsFilename");
        String content = request.getParameter("content");
        InputStream in = new ByteArrayInputStream(content.getBytes("UTF-8"));
        in.close();
        uploadToHdfs(hdfsFilename, in, configurationManager);
        PrintWriter out = response.getWriter();
        out.write("ok");
        out.close();
    }

    private void uploadToHdfs(String remoteFilename, InputStream in, ConfigurationManager cm) throws IOException {
        try {
            IFileSystem filesystem = cm.getFileSystem();
            OutputStream out = filesystem.getOutputStream(remoteFilename);
            IOUtils.copy(in, out);
            in.close();
            out.close();
        } catch (Exception e) {
            IOException ioe = new IOException(e.getMessage());
            ioe.setStackTrace(e.getStackTrace());
            throw ioe;
        }
    }
}
