package com.sap.shs;

import com.sap.ext.shield.LogSender;
import com.sap.hadoop.conf.ConfigurationManager;
import com.sap.shield.Constants;
import com.sap.shield.data.AlternateEnergyGenerator;
import com.sap.shield.data.GeneratorBase;
import com.sap.shield.data.OilDataGenerator;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.hadoop.fs.Path;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

/**
 * Created by IntelliJ IDEA.
 * User: I827779
 * Date: 2/20/13
 * Time: 11:44 AM
 * To change this template use File | Settings | File Templates.
 */
public class ShieldSendSensor extends BaseServlet {

    private final Random random = new Random();

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(true);
        String threadMapName = request.getParameter("threadMapName");
        String runnableMapName = threadMapName + "_runnable";
        Map<String, Runnable> runnableMap = (Map<String, Runnable>)session.getAttribute(runnableMapName);
        Map<String, Thread> threadMap = (Map<String, Thread>)session.getAttribute(threadMapName);
        if (threadMap == null) {
            threadMap = new HashMap<String, Thread>();
            session.setAttribute(threadMapName, threadMap);
        }
        if (runnableMap == null) {
            runnableMap = new HashMap<String, Runnable>();
            session.setAttribute(runnableMapName, runnableMap);
        }
        String type = request.getParameter("type");

        ConfigurationManager cm = ((LoginPass) session.getAttribute(ShsContext.LOGIN_PASS)).getConfigurationManager();
        if ("oil".equalsIgnoreCase(type)) {
            Path oilPath = new Path("/data/shield/oilSensors/oil.csv");
            String oilData = getData(oilPath, cm.getConfiguration());
            CSVParser oilCsvParser = new CSVParser(oilData, Constants.XS_ENGINE_CSV_FORMAT);
            for (CSVRecord csvRecord: oilCsvParser.getRecords()) {
                boolean isOil = "OIL".equalsIgnoreCase(csvRecord.get(2));
                OilDataGenerator oilDataGenerator = new OilDataGenerator(csvRecord.get(0), isOil ? (random.nextInt(32) + 10) * 10000 : 0, isOil ? 0 : (random.nextInt(6) + 1) * 1000000);
                oilDataGenerator.setEveryNMillisecond(random.nextInt(500) + 250);
                Thread thread = new Thread(oilDataGenerator);

                Runnable prevRunnable = runnableMap.put(csvRecord.get(0), oilDataGenerator);
                Thread prevThread = threadMap.put(csvRecord.get(0), thread);

                if(prevRunnable != null) {
                    ((GeneratorBase)prevRunnable).setStopRunning(true);
                    if (prevThread.isAlive()) {
                        prevThread.interrupt();
                    }
                }
                thread.start();
            }
        } else {
            Path windmillPath = new Path("/data/shield/windmillSensors/windmills.csv");
            String windmillData = getData(windmillPath, cm.getConfiguration());
            CSVParser windmillCsvParser = new CSVParser(windmillData, Constants.XS_ENGINE_CSV_FORMAT);
            for (CSVRecord csvRecord: windmillCsvParser.getRecords()) {
                AlternateEnergyGenerator alternateEnergyGenerator = new AlternateEnergyGenerator(csvRecord.get(0), (int)(Float.parseFloat(csvRecord.get(2)) * (random.nextInt(1200) + 600)));
                alternateEnergyGenerator.setEveryNMillisecond(random.nextInt(500) + 250);
                Thread thread = new Thread(alternateEnergyGenerator);

                Runnable prevRunnable = runnableMap.put(csvRecord.get(0), alternateEnergyGenerator);
                Thread prevThread = threadMap.put(csvRecord.get(0), thread);

                if(prevRunnable != null) {
                    ((GeneratorBase)prevRunnable).setStopRunning(true);
                    if (prevThread.isAlive()) {
                        prevThread.interrupt();
                    }
                }
                thread.start();
            }
        }
    }
}
