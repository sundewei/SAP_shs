package com.sap.shs;

import com.sap.shield.data.GeneratorBase;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: I827779
 * Date: 2/20/13
 * Time: 12:23 PM
 * To change this template use File | Settings | File Templates.
 */
public class ShieldSendSensorInfo extends BaseServlet {
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(true);
        String threadMapName = request.getParameter("threadMapName");
        String runnableMapName = threadMapName + "_runnable";
        String sid = request.getParameter("sid");
        Map<String, Runnable> runnableMap = (Map<String, Runnable>)session.getAttribute(runnableMapName);
        Map<String, Thread> threadMap = (Map<String, Thread>)session.getAttribute(threadMapName);
        GeneratorBase base = null;
        Thread thread = null;
        if (runnableMap != null) {
            base = (GeneratorBase)runnableMap.get(sid);
            thread = threadMap.get(sid);
        }
        PrintWriter out = response.getWriter();
        if (base != null && thread.isAlive()) {
            out.write(String.valueOf(base.getSignalCount()));
        } else {
            runnableMap.remove(sid);
            threadMap.remove(sid);
            out.write("?");
        }
        out.close();
    }
}
