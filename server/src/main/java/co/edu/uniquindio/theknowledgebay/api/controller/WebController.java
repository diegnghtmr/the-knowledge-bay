package co.edu.uniquindio.theknowledgebay.api.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class WebController {
    
    @RequestMapping(value = { "/", "/login", "/register" })
    public String forward() {
        return "forward:/index.html";
    }
}