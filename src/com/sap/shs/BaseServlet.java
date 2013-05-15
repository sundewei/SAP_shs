package com.sap.shs;

import org.apache.commons.io.IOUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;

import javax.servlet.http.HttpServlet;
import java.io.IOException;
import java.io.InputStream;

/**
 * Created by IntelliJ IDEA.
 * User: I827779
 * Date: 8/29/11
 * Time: 4:23 PM
 * To change this template use File | Settings | File Templates.
 */
public class BaseServlet extends HttpServlet {
    protected String getData(Path hdfsPath, Configuration c) throws IOException {
        FileSystem fs = hdfsPath.getFileSystem(c);
        InputStream in = fs.open(hdfsPath);
        String data = IOUtils.toString(in);
        in.close();
        return data;
    }
}
