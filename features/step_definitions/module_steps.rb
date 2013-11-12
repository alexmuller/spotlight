def values
  {
    'realtime' => {
      'no-realistic-dashboard' => {
        title: 'Real-time usage',
        description: 'Real-time usage',
        image_path: "/assets/images/module_pngs/realtime.png",
        raw: "//p[@class='impact-number']/strong[text()='15']"
      }
    },
    'journey' => {
      'no-realistic-dashboard' => {
        title: 'Users at each stage',
        description: 'Number of users who completed important stages of the transaction last week',
        raw: "//*[name()='svg']"
      }
    }
  }
end

Then(/^I should see the "(.*?)" module for "(.*?)" data$/) do |display_module, service|
  page.find(".#{display_module} .visualisation").should have_xpath(values[display_module][service][:raw])
end

Then(/^I should not see other information for the "(.*?)" "(.*?)" module$/) do |service, display_module|
  page.should have_css("body.raw")
  # FIXME: This feature should assert that title and description in the module
  # are not present. At the moment, these are visually hidden but present in
  # the page. When running tests on Travis, the styles don't seem to get
  # applied correctly. As a workaround, we are just asserting that the correct
  # class get applied to the body, which triggers the appropriate styles.
end

Then(/^I should see other information for the "(.*?)" "(.*?)" module$/) do |service, display_module|
  page.find(".#{display_module}").should have_content(values[display_module][service][:title])
  page.find(".#{display_module}").should have_content(values[display_module][service][:description])
end 

Then(/^I should see the png "(.*?)" module for "(.*?)" data$/) do |display_module, service|
  page.find("img[src='#{values[display_module][service][:image_path]}']").should_not be_nil
end
