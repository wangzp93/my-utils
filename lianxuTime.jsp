<input name="timeType" type="radio" class="RadioStyle" id="min" value="min" style="margin-left: 0px; margin-right: 5px; display: none;"  onclick="showLianxuTime.changeTimeType()" /><span id="label_min" style="display: none; margin-right: 20px" >分钟</span>
              <input id="timeField_min" class="Wdate TimeFiled" style="display: none; width: 150px;height:34px;" onclick="WdatePicker({dateFmt : \'yyyy-MM-dd HH:mm\',maxDate:\'%y-%M-%d 23:59\'})" />

             <input name="timeType" type="radio" class="RadioStyle" id="hour" value="hour" style="margin-left: 0px; margin-right: 5px; display: none;"  onclick="showLianxuTime.changeTimeType()" /><span id="label_hour" style="display: none; margin-right: 20px" >小时</span>
			  <input id="timeField_hour" class="Wdate TimeFiled" style="display: none; width: 150px;height:34px;" onclick="WdatePicker({dateFmt : \'yyyy-MM-dd HH\',maxDate:\'%y-%M-%d 23\'})" />

             <input name="timeType" type="radio" class="RadioStyle" id="day" value="day" style="margin-left: 0px;margin-right: 5px; display: none;"  onclick="showLianxuTime.changeTimeType()"  checked="checked"/><span id="label_day" style="display: none;margin-right: 20px">日</span>
			  <input id="timeField_day" class="Wdate TimeFiled" style="display: none; width: 150px;height:23px;" onclick="WdatePicker({dateFmt : \'yyyy-MM-dd\',maxDate:\'%y-%M-%d\'})" />
             
               <input name="timeType" type="radio" class="RadioStyle" id="week" value="week" style="margin-left: 0px; margin-right: 5px; display: none;"  onclick="showLianxuTime.changeTimeType()" /><span id="label_week" style="display: none;margin-right: 20px" >周</span>
			  <input id="timeField_week" class="Wdate TimeFiled" style="display:none; width: 150px;height:23px;"/>
             
              <input name="timeType" type="radio" class="RadioStyle" id="month" value="month" style="margin-left: 0px; margin-right: 5px; display: none;" onclick="showLianxuTime.changeTimeType()" /><span id="label_month" style="margin-right: 20px; display: none;margin-right: 20px">月</span>
			  <input id="timeField_month" class="Wdate TimeFiled" style="display: none; width: 150px;height:34px;"onclick="WdatePicker({dateFmt : \'yyyy-MM\',maxDate:\'%y-%M\'})" />   